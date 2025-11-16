import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(private prisma: PrismaService) {}

  async createCoupon(data: {
    code?: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    applicableTo: string;
    applicableIds?: string[];
    currency?: string;
    minPurchaseAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil?: Date;
  }) {
    const code = data.code || `COUPON_${nanoid(8).toUpperCase()}`;

    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        applicableTo: data.applicableTo,
        applicableIds: data.applicableIds || [],
        currency: data.currency || 'USD',
        minPurchaseAmount: data.minPurchaseAmount,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit || 1,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
      },
    });

    this.logger.log(`Created coupon: ${code}`);
    return coupon;
  }

  async validateCoupon(code: string, userId: string, amount: number, type: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: { userCouponUsage: true },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon');
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      throw new BadRequestException('Coupon is not yet valid');
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const userUsage = coupon.userCouponUsage.find(u => u.userId === userId);
    if (userUsage && userUsage.usageCount >= coupon.perUserLimit) {
      throw new BadRequestException('You have reached the usage limit for this coupon');
    }

    if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount.toNumber()) {
      throw new BadRequestException(`Minimum purchase amount is ${coupon.minPurchaseAmount}`);
    }

    if (coupon.applicableTo !== 'all' && coupon.applicableTo !== type) {
      throw new BadRequestException(`Coupon is not applicable to ${type}`);
    }

    return coupon;
  }

  async applyCoupon(code: string, userId: string, amount: number, type: string) {
    const coupon = await this.validateCoupon(code, userId, amount, type);

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue.toNumber()) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount.toNumber());
      }
    } else {
      discount = coupon.discountValue.toNumber();
    }

    const finalAmount = Math.max(0, amount - discount);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toNumber(),
      discount,
      originalAmount: amount,
      finalAmount,
    };
  }

  async useCoupon(couponId: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      });

      const usage = await tx.userCouponUsage.findUnique({
        where: { userId_couponId: { userId, couponId } },
      });

      if (usage) {
        await tx.userCouponUsage.update({
          where: { id: usage.id },
          data: { usageCount: { increment: 1 } },
        });
      } else {
        await tx.userCouponUsage.create({
          data: { userId, couponId, usageCount: 1 },
        });
      }
    });

    this.logger.log(`Coupon ${couponId} used by user ${userId}`);
  }

  async getCoupon(code: string) {
    return this.prisma.coupon.findUnique({ where: { code } });
  }

  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCoupon(id: string, data: any) {
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async deactivateCoupon(id: string) {
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
