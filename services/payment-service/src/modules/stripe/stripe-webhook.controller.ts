import { Controller, Post, Headers, Body, RawBodyRequest, Req, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe')
  @ApiExcludeEndpoint()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      const rawBody = request.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Missing raw body');
      }

      event = this.stripeService.constructWebhookEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      await this.handleWebhookEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      // Subscription events
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      // Payment events
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Invoice events
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Checkout session
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Refund events
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription created: ${subscription.id}`);

    const customerId = subscription.customer as string;
    const userId = subscription.metadata.userId;

    if (!userId) {
      this.logger.error('Missing userId in subscription metadata');
      return;
    }

    // Update subscription in database
    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId,
        planId: subscription.metadata.planId || '',
        status: subscription.status,
        billingCycle: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly',
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    this.logger.log(`Subscription ${subscription.id} saved to database`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated: ${subscription.id}`);

    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);

    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'cancelled',
        canceledAt: new Date(),
      },
    });
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    this.logger.log(`Trial will end for subscription: ${subscription.id}`);
    // TODO: Send notification email to user
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    const userId = paymentIntent.metadata.userId;
    if (!userId) {
      this.logger.error('Missing userId in payment intent metadata');
      return;
    }

    await this.prisma.paymentTransaction.upsert({
      where: { stripePaymentIntentId: paymentIntent.id },
      create: {
        userId,
        transactionType: paymentIntent.metadata.type || 'subscription',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded',
        paymentGateway: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        resourceId: paymentIntent.metadata.resourceId,
      },
      update: {
        status: 'succeeded',
      },
    });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);

    const userId = paymentIntent.metadata.userId;
    if (!userId) {
      return;
    }

    await this.prisma.paymentTransaction.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'failed',
        errorMessage: paymentIntent.last_payment_error?.message,
      },
    });

    // TODO: Send payment failure notification
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice paid: ${invoice.id}`);
    // TODO: Generate and send invoice PDF
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);
    // TODO: Send payment failure notification
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Checkout session completed: ${session.id}`);

    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.error('Missing userId in checkout session metadata');
      return;
    }

    // Handle based on mode
    if (session.mode === 'payment') {
      // One-time payment (course, bootcamp, digital product)
      const paymentIntentId = session.payment_intent as string;
      // Payment will be handled by payment_intent.succeeded event
    } else if (session.mode === 'subscription') {
      // Subscription will be handled by subscription events
    }

    // TODO: Send purchase confirmation email
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    this.logger.log(`Charge refunded: ${charge.id}`);

    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) {
      return;
    }

    await this.prisma.paymentTransaction.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        status: 'refunded',
        refundedAmount: charge.amount_refunded / 100,
        refundedAt: new Date(),
      },
    });

    // TODO: Send refund confirmation email
  }
}
