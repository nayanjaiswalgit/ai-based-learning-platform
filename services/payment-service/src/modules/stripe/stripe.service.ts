import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    this.logger.log('✅ Stripe initialized successfully');
  }

  // =====================================================
  // CUSTOMER MANAGEMENT
  // =====================================================

  async createCustomer(userId: string, email: string, name?: string): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    this.logger.log(`Created Stripe customer: ${customer.id} for user: ${userId}`);
    return customer;
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return this.stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
  }

  async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, data);
  }

  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    return this.stripe.customers.del(customerId);
  }

  // =====================================================
  // SUBSCRIPTION MANAGEMENT
  // =====================================================

  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    const { customerId, priceId, trialPeriodDays, metadata } = params;

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialPeriodDays,
      metadata: metadata || {},
      expand: ['latest_invoice.payment_intent'],
    });

    this.logger.log(`Created subscription: ${subscription.id} for customer: ${customerId}`);
    return subscription;
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, params);
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    if (immediately) {
      return this.stripe.subscriptions.cancel(subscriptionId);
    }

    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  // =====================================================
  // PAYMENT INTENT
  // =====================================================

  async createPaymentIntent(params: {
    amount: number; // in cents
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    const { amount, currency, customerId, metadata } = params;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    this.logger.log(`Created payment intent: ${paymentIntent.id}`);
    return paymentIntent;
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  // =====================================================
  // CHECKOUT SESSION
  // =====================================================

  async createCheckoutSession(params: {
    customerId?: string;
    customerEmail?: string;
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    mode: 'payment' | 'subscription' | 'setup';
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    trialPeriodDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    const { customerId, customerEmail, lineItems, mode, successUrl, cancelUrl, metadata, trialPeriodDays } = params;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    if (mode === 'subscription' && trialPeriodDays) {
      sessionParams.subscription_data = {
        trial_period_days: trialPeriodDays,
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    this.logger.log(`Created checkout session: ${session.id}`);
    return session;
  }

  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  // =====================================================
  // CUSTOMER PORTAL
  // =====================================================

  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  // =====================================================
  // REFUNDS
  // =====================================================

  async createRefund(params: {
    paymentIntentId?: string;
    chargeId?: string;
    amount?: number;
    reason?: Stripe.RefundCreateParams.Reason;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    const { paymentIntentId, chargeId, amount, reason, metadata } = params;

    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      charge: chargeId,
      amount,
      reason,
      metadata: metadata || {},
    });

    this.logger.log(`Created refund: ${refund.id}`);
    return refund;
  }

  // =====================================================
  // PRODUCTS & PRICES
  // =====================================================

  async createProduct(params: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Product> {
    const { name, description, metadata } = params;

    return this.stripe.products.create({
      name,
      description,
      metadata: metadata || {},
    });
  }

  async createPrice(params: {
    productId: string;
    unitAmount: number; // in cents
    currency: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      intervalCount?: number;
    };
    metadata?: Record<string, string>;
  }): Promise<Stripe.Price> {
    const { productId, unitAmount, currency, recurring, metadata } = params;

    return this.stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency,
      recurring,
      metadata: metadata || {},
    });
  }

  async listProducts(params?: Stripe.ProductListParams): Promise<Stripe.ApiList<Stripe.Product>> {
    return this.stripe.products.list(params);
  }

  async listPrices(params?: Stripe.PriceListParams): Promise<Stripe.ApiList<Stripe.Price>> {
    return this.stripe.prices.list(params);
  }

  // =====================================================
  // COUPONS & PROMOTIONS
  // =====================================================

  async createCoupon(params: {
    percentOff?: number;
    amountOff?: number;
    currency?: string;
    duration: 'forever' | 'once' | 'repeating';
    durationInMonths?: number;
    maxRedemptions?: number;
    redeemBy?: number;
    name?: string;
  }): Promise<Stripe.Coupon> {
    const { percentOff, amountOff, currency, duration, durationInMonths, maxRedemptions, redeemBy, name } = params;

    return this.stripe.coupons.create({
      percent_off: percentOff,
      amount_off: amountOff,
      currency,
      duration,
      duration_in_months: durationInMonths,
      max_redemptions: maxRedemptions,
      redeem_by: redeemBy,
      name,
    });
  }

  async createPromotionCode(params: {
    couponId: string;
    code: string;
    active?: boolean;
    maxRedemptions?: number;
    expiresAt?: number;
  }): Promise<Stripe.PromotionCode> {
    const { couponId, code, active, maxRedemptions, expiresAt } = params;

    return this.stripe.promotionCodes.create({
      coupon: couponId,
      code,
      active,
      max_redemptions: maxRedemptions,
      expires_at: expiresAt,
    });
  }

  // =====================================================
  // WEBHOOK VERIFICATION
  // =====================================================

  constructWebhookEvent(payload: Buffer | string, signature: string, secret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  async getBalance(): Promise<Stripe.Balance> {
    return this.stripe.balance.retrieve();
  }

  async listPaymentMethods(customerId: string, type?: string): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    return this.stripe.paymentMethods.list({
      customer: customerId,
      type: type as any,
    });
  }

  getStripeClient(): Stripe {
    return this.stripe;
  }
}
