import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  // =====================================================
  // SUBSCRIPTION PLANS
  // =====================================================

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        regionalPricing: true,
      },
    });
  }

  async getPlan(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        regionalPricing: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${planId}`);
    }

    return plan;
  }

  async createPlan(data: {
    name: string;
    displayName: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    features: any;
    maxCourses?: number;
    maxProjects?: number;
    hasAIFeatures: boolean;
    hasPrioritySupport: boolean;
    trialDays?: number;
  }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
        currency: data.currency,
        features: data.features,
        maxCourses: data.maxCourses,
        maxProjects: data.maxProjects,
        hasAIFeatures: data.hasAIFeatures,
        hasPrioritySupport: data.hasPrioritySupport,
        trialDays: data.trialDays || 7,
      },
    });
  }

  async updatePlan(planId: string, data: any) {
    return this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });
  }

  // =====================================================
  // USER SUBSCRIPTIONS
  // =====================================================

  async getUserSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['active', 'trialing'],
        },
      },
      include: {
        plan: true,
      },
    });
  }

  async createSubscription(params: {
    userId: string;
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    paymentMethod?: 'stripe' | 'razorpay' | 'paypal' | 'paddle';
    customerId?: string;
    email: string;
    countryCode?: string;
  }) {
    const { userId, planId, billingCycle, paymentMethod = 'stripe', customerId, email, countryCode } = params;

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Get plan details
    const plan = await this.getPlan(planId);

    // Calculate price (considering PPP if country code provided)
    let price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

    if (countryCode) {
      const regionalPrice = await this.prisma.regionalPricing.findFirst({
        where: {
          planId,
          countryCode,
          isActive: true,
        },
      });

      if (regionalPrice) {
        price = billingCycle === 'monthly' ? regionalPrice.priceMonthly : regionalPrice.priceYearly;
      }
    }

    // Create subscription based on payment method
    if (paymentMethod === 'stripe') {
      return this.createStripeSubscription({
        userId,
        planId,
        billingCycle,
        customerId,
        email,
        price: price.toNumber(),
        trialDays: plan.trialDays,
      });
    }

    // Add other payment methods (Razorpay, PayPal, Paddle) similarly
    throw new BadRequestException(`Payment method ${paymentMethod} not implemented yet`);
  }

  private async createStripeSubscription(params: {
    userId: string;
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    customerId?: string;
    email: string;
    price: number;
    trialDays: number;
  }) {
    const { userId, planId, billingCycle, email, price, trialDays } = params;
    let { customerId } = params;

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await this.stripeService.createCustomer(userId, email);
      customerId = customer.id;
    }

    // Get or create Stripe price
    const priceId = await this.getOrCreateStripePrice(planId, billingCycle, price);

    // Create Stripe subscription
    const stripeSubscription = await this.stripeService.createSubscription({
      customerId,
      priceId,
      trialPeriodDays: trialDays,
      metadata: {
        userId,
        planId,
      },
    });

    // Create subscription in database
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: stripeSubscription.status,
        billingCycle,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      },
      include: {
        plan: true,
      },
    });

    this.logger.log(`Created subscription for user ${userId}: ${subscription.id}`);
    return subscription;
  }

  private async getOrCreateStripePrice(planId: string, billingCycle: 'monthly' | 'yearly', amount: number): Promise<string> {
    // This would typically look up or create a Stripe price
    // For now, return the configured price ID from env
    const envKey = billingCycle === 'monthly' ? 'STRIPE_PRODUCT_PRO_MONTHLY' : 'STRIPE_PRODUCT_PRO_YEARLY';
    const priceId = this.configService.get<string>(envKey);

    if (!priceId) {
      throw new Error(`Stripe price not configured for ${billingCycle} plan`);
    }

    return priceId;
  }

  // =====================================================
  // SUBSCRIPTION MANAGEMENT
  // =====================================================

  async upgradeSubscription(userId: string, newPlanId: string) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.getPlan(newPlanId);

    if (subscription.stripeSubscriptionId) {
      // Get new price ID
      const newPriceId = await this.getOrCreateStripePrice(
        newPlanId,
        subscription.billingCycle,
        subscription.billingCycle === 'monthly' ? newPlan.priceMonthly.toNumber() : newPlan.priceYearly.toNumber(),
      );

      // Update Stripe subscription
      await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, {
        items: [
          {
            id: subscription.stripePriceId!,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice',
      });

      // Update database
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: newPlanId,
          stripePriceId: newPriceId,
        },
      });

      this.logger.log(`Upgraded subscription for user ${userId} to plan ${newPlanId}`);
    }

    return this.getUserSubscription(userId);
  }

  async downgradeSubscription(userId: string, newPlanId: string) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.getPlan(newPlanId);

    if (subscription.stripeSubscriptionId) {
      const newPriceId = await this.getOrCreateStripePrice(
        newPlanId,
        subscription.billingCycle,
        subscription.billingCycle === 'monthly' ? newPlan.priceMonthly.toNumber() : newPlan.priceYearly.toNumber(),
      );

      // Schedule downgrade at period end
      await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, {
        items: [
          {
            id: subscription.stripePriceId!,
            price: newPriceId,
          },
        ],
        proration_behavior: 'none',
      });

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: newPlanId,
          stripePriceId: newPriceId,
        },
      });

      this.logger.log(`Downgraded subscription for user ${userId} to plan ${newPlanId}`);
    }

    return this.getUserSubscription(userId);
  }

  async cancelSubscription(userId: string, immediately = false) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediately);

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: !immediately,
          status: immediately ? 'cancelled' : subscription.status,
          canceledAt: immediately ? new Date() : null,
        },
      });

      this.logger.log(`Cancelled subscription for user ${userId}, immediate: ${immediately}`);
    }

    return this.getUserSubscription(userId);
  }

  async resumeSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        cancelAtPeriodEnd: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No cancelled subscription found to resume');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.resumeSubscription(subscription.stripeSubscriptionId);

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: false,
        },
      });

      this.logger.log(`Resumed subscription for user ${userId}`);
    }

    return this.getUserSubscription(userId);
  }

  // =====================================================
  // SUBSCRIPTION STATS
  // =====================================================

  async getSubscriptionStats() {
    const [total, active, trialing, cancelled, expired] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.prisma.subscription.count({ where: { status: 'trialing' } }),
      this.prisma.subscription.count({ where: { status: 'cancelled' } }),
      this.prisma.subscription.count({ where: { status: 'expired' } }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: {
          in: ['active', 'trialing'],
        },
      },
      include: {
        plan: true,
      },
    });

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const monthlyPrice =
        sub.billingCycle === 'monthly'
          ? sub.plan.priceMonthly.toNumber()
          : sub.plan.priceYearly.toNumber() / 12;
      return sum + monthlyPrice;
    }, 0);

    return {
      total,
      active,
      trialing,
      cancelled,
      expired,
      mrr: Math.round(mrr * 100) / 100,
      currency: 'USD',
    };
  }
}
