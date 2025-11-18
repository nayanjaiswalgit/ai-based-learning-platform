import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../stripe/stripe.service';
import { RazorpayService } from './razorpay.service';
import { PayPalService } from './paypal.service';
import { PaddleService } from './paddle.service';
import {
  PaymentGatewayType,
  CreatePaymentParams,
  PaymentResponse,
  VerifyPaymentParams,
  RefundPaymentParams,
  RefundResponse,
} from './payment-gateway.interface';
import geoip from 'geoip-lite';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private configService: ConfigService,
    private stripeService: StripeService,
    private razorpayService: RazorpayService,
    private paypalService: PayPalService,
    private paddleService: PaddleService,
  ) {}

  // =====================================================
  // GATEWAY SELECTION
  // =====================================================

  selectGateway(countryCode?: string, preferredGateway?: PaymentGatewayType): PaymentGatewayType {
    // If preferred gateway is specified, use it
    if (preferredGateway) {
      return preferredGateway;
    }

    // Route based on country
    if (countryCode) {
      // India -> Razorpay
      if (countryCode === 'IN') {
        return PaymentGatewayType.RAZORPAY;
      }

      // Europe -> Paddle or Stripe
      const europeanCountries = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI'];
      if (europeanCountries.includes(countryCode)) {
        return PaymentGatewayType.PADDLE;
      }

      // US, Canada, Australia -> Stripe
      const stripePreferredCountries = ['US', 'CA', 'AU', 'NZ', 'SG'];
      if (stripePreferredCountries.includes(countryCode)) {
        return PaymentGatewayType.STRIPE;
      }
    }

    // Default to Stripe
    return PaymentGatewayType.STRIPE;
  }

  detectCountryFromIP(ipAddress: string): string | null {
    const geo = geoip.lookup(ipAddress);
    return geo?.country || null;
  }

  // =====================================================
  // UNIFIED PAYMENT INTERFACE
  // =====================================================

  async createPayment(
    params: CreatePaymentParams,
    gateway?: PaymentGatewayType,
    ipAddress?: string,
  ): Promise<PaymentResponse> {
    // Detect country from IP if not specified
    let countryCode: string | undefined;
    if (ipAddress) {
      countryCode = this.detectCountryFromIP(ipAddress) || undefined;
    }

    // Select appropriate gateway
    const selectedGateway = this.selectGateway(countryCode, gateway);

    this.logger.log(`Creating payment via ${selectedGateway} for amount: ${params.amount} ${params.currency}`);

    switch (selectedGateway) {
      case PaymentGatewayType.STRIPE:
        return this.createStripePayment(params);

      case PaymentGatewayType.RAZORPAY:
        return this.razorpayService.createPayment(params);

      case PaymentGatewayType.PAYPAL:
        return this.paypalService.createPayment(params);

      case PaymentGatewayType.PADDLE:
        return this.paddleService.createPayment(params);

      default:
        throw new BadRequestException(`Unsupported payment gateway: ${selectedGateway}`);
    }
  }

  private async createStripePayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency,
      metadata: {
        userId: params.userId,
        ...params.metadata,
      },
    });

    return {
      paymentId: paymentIntent.id,
      amount: params.amount,
      currency: params.currency,
      status: paymentIntent.status,
      gateway: PaymentGatewayType.STRIPE,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  async verifyPayment(gateway: PaymentGatewayType, params: VerifyPaymentParams): Promise<boolean> {
    switch (gateway) {
      case PaymentGatewayType.STRIPE:
        return this.verifyStripePayment(params);

      case PaymentGatewayType.RAZORPAY:
        return this.razorpayService.verifyPayment(params);

      case PaymentGatewayType.PAYPAL:
        return this.paypalService.verifyPayment(params);

      case PaymentGatewayType.PADDLE:
        return this.paddleService.verifyPayment(params);

      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }

  private async verifyStripePayment(params: VerifyPaymentParams): Promise<boolean> {
    try {
      const paymentIntent = await this.stripeService.getPaymentIntent(params.paymentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      this.logger.error(`Error verifying Stripe payment: ${error.message}`);
      return false;
    }
  }

  async refundPayment(gateway: PaymentGatewayType, params: RefundPaymentParams): Promise<RefundResponse> {
    switch (gateway) {
      case PaymentGatewayType.STRIPE:
        return this.refundStripePayment(params);

      case PaymentGatewayType.RAZORPAY:
        return this.razorpayService.refundPayment(params);

      case PaymentGatewayType.PAYPAL:
        return this.paypalService.refundPayment(params);

      case PaymentGatewayType.PADDLE:
        return this.paddleService.refundPayment(params);

      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }

  private async refundStripePayment(params: RefundPaymentParams): Promise<RefundResponse> {
    const refund = await this.stripeService.createRefund({
      paymentIntentId: params.paymentId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      reason: params.reason as any,
    });

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency.toUpperCase(),
      status: refund.status || "unknown",
    };
  }

  // =====================================================
  // CURRENCY CONVERSION
  // =====================================================

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // This would integrate with a currency conversion API
    // For now, using a simple placeholder
    const conversionRates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.85, GBP: 0.73, INR: 83.0, AUD: 1.52 },
      EUR: { USD: 1.18, GBP: 0.86, INR: 97.5, AUD: 1.79 },
      GBP: { USD: 1.37, EUR: 1.16, INR: 113.5, AUD: 2.08 },
      INR: { USD: 0.012, EUR: 0.010, GBP: 0.0088, AUD: 0.018 },
    };

    const rate = conversionRates[fromCurrency]?.[toCurrency] || 1;
    return Math.round(amount * rate * 100) / 100;
  }

  getSupportedCurrencies(gateway: PaymentGatewayType): string[] {
    const currencyMap: Record<PaymentGatewayType, string[]> = {
      [PaymentGatewayType.STRIPE]: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'INR', 'JPY', 'CNY'],
      [PaymentGatewayType.RAZORPAY]: ['INR'],
      [PaymentGatewayType.PAYPAL]: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      [PaymentGatewayType.PADDLE]: ['USD', 'EUR', 'GBP'],
    };

    return currencyMap[gateway] || ['USD'];
  }
}
