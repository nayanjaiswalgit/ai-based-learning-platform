import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  constructor(private prisma: PrismaService) {}

  async createAffiliate(userId: string, programId: string) {
    const existing = await this.prisma.affiliate.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('User is already an affiliate');
    }

    const affiliateCode = `AFF_${nanoid(10).toUpperCase()}`;

    const affiliate = await this.prisma.affiliate.create({
      data: {
        userId,
        programId,
        affiliateCode,
      },
      include: {
        program: true,
      },
    });

    this.logger.log(`Created affiliate: ${affiliateCode} for user ${userId}`);
    return affiliate;
  }

  async trackReferral(affiliateCode: string, userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { affiliateCode },
    });

    if (!affiliate || !affiliate.isActive) {
      throw new BadRequestException('Invalid affiliate code');
    }

    const referral = await this.prisma.affiliateReferral.create({
      data: {
        affiliateId: affiliate.id,
        userId,
        clickedAt: new Date(),
      },
    });

    await this.prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { clickCount: { increment: 1 } },
    });

    this.logger.log(`Tracked referral for affiliate ${affiliateCode}`);
    return referral;
  }

  async recordConversion(
    referralId: string,
    transactionAmount: number,
    commissionRate: number,
  ) {
    const referral = await this.prisma.affiliateReferral.findUnique({
      where: { id: referralId },
      include: { affiliate: true },
    });

    if (!referral) {
      throw new BadRequestException('Referral not found');
    }

    const commissionAmount = transactionAmount * commissionRate;

    await this.prisma.$transaction([
      this.prisma.affiliateReferral.update({
        where: { id: referralId },
        data: {
          convertedAt: new Date(),
          commissionAmount,
          commissionStatus: 'pending',
        },
      }),
      this.prisma.affiliate.update({
        where: { id: referral.affiliateId },
        data: {
          conversionCount: { increment: 1 },
          pendingEarnings: { increment: commissionAmount },
          totalEarnings: { increment: commissionAmount },
        },
      }),
    ]);

    this.logger.log(
      `Recorded conversion for referral ${referralId}, commission: ${commissionAmount}`,
    );
  }

  async getAffiliateStats(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: {
        referrals: true,
        payouts: true,
      },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate not found');
    }

    const conversionRate =
      affiliate.clickCount > 0
        ? (affiliate.conversionCount / affiliate.clickCount) * 100
        : 0;

    return {
      ...affiliate,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async requestPayout(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: { program: true },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate not found');
    }

    const minPayout = affiliate.program.minPayout.toNumber();
    if (affiliate.pendingEarnings.toNumber() < minPayout) {
      throw new BadRequestException(
        `Minimum payout amount is ${minPayout}. Current balance: ${affiliate.pendingEarnings}`,
      );
    }

    const payout = await this.prisma.affiliatePayout.create({
      data: {
        affiliateId: affiliate.id,
        amount: affiliate.pendingEarnings,
        paymentMethod: affiliate.paymentMethod || 'bank_transfer',
        paymentDetails: affiliate.paymentDetails || {},
        status: 'pending',
      },
    });

    await this.prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        pendingEarnings: 0,
      },
    });

    this.logger.log(
      `Payout requested for affiliate ${affiliate.affiliateCode}: ${affiliate.pendingEarnings}`,
    );
    return payout;
  }
}
