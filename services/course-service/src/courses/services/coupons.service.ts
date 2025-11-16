import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    // Check if coupon code already exists
    const existing = await this.prisma.coupon.findUnique({
      where: { code: createCouponDto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    return this.prisma.coupon.create({
      data: {
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
        applicableCourses: createCouponDto.applicableCourses || undefined,
      },
    });
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};

    return this.prisma.coupon.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(code: string, updateData: Partial<CreateCouponDto>) {
    await this.findByCode(code);

    return this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: updateData,
    });
  }

  async deactivate(code: string) {
    return this.update(code, { isActive: false });
  }

  /**
   * Validate and apply a coupon
   */
  async validateCoupon(code: string, courseId?: string) {
    const coupon = await this.findByCode(code);

    // Check if coupon is active
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    // Check if coupon has reached max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon has reached maximum usage limit');
    }

    // Check validity period
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BadRequestException('Coupon is not valid at this time');
    }

    // Check if coupon is applicable to the course
    if (courseId && coupon.applicableCourses) {
      const applicableCourses = coupon.applicableCourses as string[];
      if (!applicableCourses.includes(courseId)) {
        throw new BadRequestException('Coupon is not applicable to this course');
      }
    }

    return {
      valid: true,
      couponType: coupon.couponType,
      discountValue: Number(coupon.discountValue),
      message: 'Coupon is valid and can be applied',
    };
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(originalPrice: number, discountValue: number, couponType: string): number {
    if (couponType === 'percentage') {
      return (originalPrice * discountValue) / 100;
    } else if (couponType === 'fixed') {
      return Math.min(discountValue, originalPrice);
    }
    return 0;
  }

  /**
   * Increment coupon usage count
   */
  async incrementUsage(code: string) {
    return this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }
}
