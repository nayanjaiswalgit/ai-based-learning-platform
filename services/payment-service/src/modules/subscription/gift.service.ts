import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

@Injectable()
export class GiftSubscriptionService {
  private readonly logger = new Logger(GiftSubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async createGiftSubscription(params: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    recipientEmail: string;
    recipientName?: string;
    giftMessage?: string;
    purchaserId: string;
    purchaserName: string;
  }) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: params.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const price = params.billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
    const giftCode = `GIFT-${nanoid(12).toUpperCase()}`;

    // Create gift record in a separate table (we'll need to add this to schema)
    // For now, we'll use metadata in a transaction

    // Create payment for the gift
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: Math.round(price.toNumber() * 100),
      currency: plan.currency,
      metadata: {
        type: 'gift_subscription',
        planId: params.planId,
        billingCycle: params.billingCycle,
        recipientEmail: params.recipientEmail,
        purchaserId: params.purchaserId,
        giftCode,
      },
    });

    this.logger.log(`Created gift subscription: ${giftCode}`);

    return {
      giftCode,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: price.toNumber(),
      currency: plan.currency,
      recipientEmail: params.recipientEmail,
      status: 'pending_payment',
    };
  }

  async redeemGift(giftCode: string, userId: string) {
    // In a real implementation, we'd have a gifts table
    // For now, we'll use a simplified approach

    // Find the payment transaction with this gift code
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        metadata: {
          path: ['giftCode'],
          equals: giftCode,
        },
        status: 'succeeded',
      },
    });

    if (!transaction) {
      throw new BadRequestException('Invalid or already redeemed gift code');
    }

    const metadata = transaction.metadata as any;
    const planId = metadata.planId;
    const billingCycle = metadata.billingCycle;

    // Create subscription for the recipient
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Get or create Stripe price
    const priceId = this.configService.get<string>(
      billingCycle === 'monthly' ? 'STRIPE_PRODUCT_PRO_MONTHLY' : 'STRIPE_PRODUCT_PRO_YEARLY',
    );

    // Create subscription (this would use the existing subscription service)
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        billingCycle,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000,
        ),
      },
    });

    // Mark gift as redeemed
    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        metadata: {
          ...metadata,
          redeemedAt: new Date().toISOString(),
          redeemedBy: userId,
        },
      },
    });

    this.logger.log(`Gift ${giftCode} redeemed by user ${userId}`);

    return {
      subscription,
      message: 'Gift subscription redeemed successfully!',
    };
  }

  async getGiftStatus(giftCode: string) {
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        metadata: {
          path: ['giftCode'],
          equals: giftCode,
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Gift not found');
    }

    const metadata = transaction.metadata as any;

    return {
      giftCode,
      status: transaction.status,
      isRedeemed: !!metadata.redeemedAt,
      redeemedAt: metadata.redeemedAt,
      recipientEmail: metadata.recipientEmail,
      planId: metadata.planId,
      billingCycle: metadata.billingCycle,
    };
  }
}
