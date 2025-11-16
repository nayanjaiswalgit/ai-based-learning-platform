import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);
  private readonly instructorRevenueShare: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.instructorRevenueShare = parseFloat(
      this.configService.get<string>('INSTRUCTOR_REVENUE_SHARE') || '0.70',
    );
  }

  async recordInstructorRevenue(params: {
    instructorId: string;
    transactionId: string;
    grossAmount: number;
    courseId?: string;
    bootcampId?: string;
    digitalProductId?: string;
  }) {
    const platformFee = params.grossAmount * (1 - this.instructorRevenueShare);
    const instructorEarnings = params.grossAmount - platformFee;

    const revenue = await this.prisma.instructorRevenue.create({
      data: {
        instructorId: params.instructorId,
        transactionId: params.transactionId,
        courseId: params.courseId,
        bootcampId: params.bootcampId,
        digitalProductId: params.digitalProductId,
        grossAmount: params.grossAmount,
        platformFee,
        instructorEarnings,
        revenueShare: this.instructorRevenueShare * 100,
        payoutStatus: 'pending',
      },
    });

    this.logger.log(
      `Recorded instructor revenue: ${instructorEarnings} for instructor ${params.instructorId}`,
    );
    return revenue;
  }

  async getInstructorEarnings(instructorId: string) {
    const [totalEarnings, pendingEarnings, paidEarnings] = await Promise.all([
      this.prisma.instructorRevenue.aggregate({
        where: { instructorId },
        _sum: { instructorEarnings: true },
      }),
      this.prisma.instructorRevenue.aggregate({
        where: { instructorId, payoutStatus: 'pending' },
        _sum: { instructorEarnings: true },
      }),
      this.prisma.instructorRevenue.aggregate({
        where: { instructorId, payoutStatus: 'paid' },
        _sum: { instructorEarnings: true },
      }),
    ]);

    return {
      totalEarnings: totalEarnings._sum.instructorEarnings?.toNumber() || 0,
      pendingEarnings: pendingEarnings._sum.instructorEarnings?.toNumber() || 0,
      paidEarnings: paidEarnings._sum.instructorEarnings?.toNumber() || 0,
      currency: 'USD',
    };
  }

  async createPayout(instructorId: string) {
    const pendingRevenue = await this.prisma.instructorRevenue.findMany({
      where: {
        instructorId,
        payoutStatus: 'pending',
      },
    });

    if (pendingRevenue.length === 0) {
      throw new Error('No pending earnings to payout');
    }

    const totalAmount = pendingRevenue.reduce(
      (sum, rev) => sum + rev.instructorEarnings.toNumber(),
      0,
    );

    const payout = await this.prisma.instructorPayout.create({
      data: {
        instructorId,
        amount: totalAmount,
        paymentMethod: 'stripe_connect',
        paymentDetails: {},
        periodStart: pendingRevenue[0].createdAt,
        periodEnd: new Date(),
        status: 'pending',
      },
    });

    await this.prisma.instructorRevenue.updateMany({
      where: {
        instructorId,
        payoutStatus: 'pending',
      },
      data: {
        payoutStatus: 'processing',
        payoutId: payout.id,
      },
    });

    this.logger.log(
      `Created payout ${payout.id} for instructor ${instructorId}: ${totalAmount}`,
    );
    return payout;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processMonthlyPayouts() {
    this.logger.log('Processing monthly instructor payouts...');

    const instructorsWithPendingEarnings = await this.prisma.instructorRevenue.groupBy({
      by: ['instructorId'],
      where: {
        payoutStatus: 'pending',
      },
    });

    for (const { instructorId } of instructorsWithPendingEarnings) {
      try {
        await this.createPayout(instructorId);
      } catch (error) {
        this.logger.error(
          `Error creating payout for instructor ${instructorId}: ${error.message}`,
        );
      }
    }

    this.logger.log('Monthly payouts processing completed');
  }

  async getPayoutHistory(instructorId: string) {
    return this.prisma.instructorPayout.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
