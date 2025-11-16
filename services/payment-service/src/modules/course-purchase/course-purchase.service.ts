import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';
import { CouponService } from '../coupon/coupon.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { PayoutService } from '../payout/payout.service';
import { PaymentGatewayType } from '../payment-gateway/payment-gateway.interface';

@Injectable()
export class CoursePurchaseService {
  private readonly logger = new Logger(CoursePurchaseService.name);

  constructor(
    private prisma: PrismaService,
    private paymentGatewayService: PaymentGatewayService,
    private couponService: CouponService,
    private affiliateService: AffiliateService,
    private payoutService: PayoutService,
  ) {}

  async purchaseCourse(params: {
    userId: string;
    courseId: string;
    email: string;
    amount: number;
    currency?: string;
    couponCode?: string;
    affiliateCode?: string;
    gateway?: PaymentGatewayType;
    ipAddress?: string;
  }) {
    const { userId, courseId, email, couponCode, affiliateCode } = params;
    let { amount, currency = 'USD' } = params;

    // Apply coupon if provided
    let couponId: string | undefined;
    if (couponCode) {
      try {
        const couponResult = await this.couponService.applyCoupon(
          couponCode,
          userId,
          amount,
          'course',
        );
        amount = couponResult.finalAmount;
        couponId = couponResult.couponId;
        this.logger.log(`Applied coupon ${couponCode}, new amount: ${amount}`);
      } catch (error) {
        this.logger.warn(`Coupon ${couponCode} invalid: ${error.message}`);
        // Continue without coupon
      }
    }

    // Track affiliate referral if provided
    let affiliateReferralId: string | undefined;
    if (affiliateCode) {
      try {
        const referral = await this.affiliateService.trackReferral(affiliateCode, userId);
        affiliateReferralId = referral.id;
      } catch (error) {
        this.logger.warn(`Affiliate code ${affiliateCode} invalid: ${error.message}`);
      }
    }

    // Create payment
    const payment = await this.paymentGatewayService.createPayment(
      {
        amount,
        currency,
        userId,
        email,
        description: `Course purchase: ${courseId}`,
        metadata: {
          type: 'course',
          courseId,
          couponCode,
          affiliateCode,
        },
      },
      params.gateway,
      params.ipAddress,
    );

    // Create transaction record
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        userId,
        transactionType: 'course',
        amount,
        currency,
        status: 'pending',
        paymentGateway: payment.gateway,
        resourceId: courseId,
        couponId,
        affiliateReferralId,
        stripePaymentIntentId: payment.paymentId,
      },
    });

    this.logger.log(`Created course purchase transaction: ${transaction.id}`);

    return {
      transactionId: transaction.id,
      payment,
    };
  }

  async completePurchase(transactionId: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new BadRequestException(`Transaction already ${transaction.status}`);
    }

    // Verify payment with gateway
    const isVerified = await this.paymentGatewayService.verifyPayment(
      transaction.paymentGateway as PaymentGatewayType,
      {
        paymentId: transaction.stripePaymentIntentId || '',
      },
    );

    if (!isVerified) {
      throw new BadRequestException('Payment verification failed');
    }

    // Update transaction
    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: { status: 'succeeded' },
    });

    // Use coupon
    if (transaction.couponId) {
      await this.couponService.useCoupon(transaction.couponId, transaction.userId);
    }

    // Record affiliate conversion
    if (transaction.affiliateReferralId) {
      await this.affiliateService.recordConversion(
        transaction.affiliateReferralId,
        transaction.amount.toNumber(),
        0.1, // 10% commission
      );
    }

    // Record instructor revenue (assuming we fetch course details)
    // In a real scenario, we'd fetch the course and get the instructor ID
    // await this.payoutService.recordInstructorRevenue({
    //   instructorId: course.instructorId,
    //   transactionId: transaction.id,
    //   grossAmount: transaction.amount.toNumber(),
    //   courseId: transaction.resourceId!,
    // });

    this.logger.log(`Course purchase completed: ${transactionId}`);

    return {
      success: true,
      transactionId,
      courseId: transaction.resourceId,
    };
  }

  async getUserPurchases(userId: string) {
    return this.prisma.paymentTransaction.findMany({
      where: {
        userId,
        transactionType: 'course',
        status: 'succeeded',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async purchaseBundle(params: {
    userId: string;
    courseIds: string[];
    email: string;
    bundlePrice: number;
    currency?: string;
    gateway?: PaymentGatewayType;
  }) {
    const { userId, courseIds, email, bundlePrice, currency = 'USD', gateway } = params;

    const payment = await this.paymentGatewayService.createPayment(
      {
        amount: bundlePrice,
        currency,
        userId,
        email,
        description: `Course bundle: ${courseIds.length} courses`,
        metadata: {
          type: 'bundle',
          courseIds: courseIds.join(','),
        },
      },
      gateway,
    );

    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        userId,
        transactionType: 'course',
        amount: bundlePrice,
        currency,
        status: 'pending',
        paymentGateway: payment.gateway,
        metadata: { courseIds },
        stripePaymentIntentId: payment.paymentId,
      },
    });

    this.logger.log(`Created bundle purchase: ${transaction.id} with ${courseIds.length} courses`);

    return {
      transactionId: transaction.id,
      payment,
    };
  }
}
