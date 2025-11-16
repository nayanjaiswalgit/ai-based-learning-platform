import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import {
  IPaymentGateway,
  CreatePaymentParams,
  PaymentResponse,
  VerifyPaymentParams,
  RefundPaymentParams,
  RefundResponse,
  PaymentStatus,
  PaymentGatewayType,
} from './payment-gateway.interface';

@Injectable()
export class RazorpayService implements IPaymentGateway {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.logger.log('✅ Razorpay initialized successfully');
    } else {
      this.logger.warn('⚠️ Razorpay credentials not configured');
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    const order = await this.razorpay.orders.create({
      amount: Math.round(params.amount * 100), // Convert to paise
      currency: params.currency,
      receipt: `order_${Date.now()}`,
      notes: {
        userId: params.userId,
        email: params.email,
        ...params.metadata,
      },
    });

    this.logger.log(`Created Razorpay order: ${order.id}`);

    return {
      paymentId: '',
      orderId: order.id,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      gateway: PaymentGatewayType.RAZORPAY,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    const { orderId, paymentId, signature } = params;

    if (!orderId || !paymentId || !signature) {
      return false;
    }

    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const body = orderId + '|' + paymentId;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret!)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;

    if (isValid) {
      this.logger.log(`Razorpay payment verified: ${paymentId}`);
    } else {
      this.logger.error(`Razorpay payment verification failed: ${paymentId}`);
    }

    return isValid;
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundResponse> {
    const refund = await this.razorpay.payments.refund(params.paymentId, {
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      notes: {
        reason: params.reason,
      },
    });

    this.logger.log(`Created Razorpay refund: ${refund.id}`);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency.toUpperCase(),
      status: refund.status,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = await this.razorpay.payments.fetch(paymentId);

    return {
      paymentId: payment.id,
      status: this.mapRazorpayStatus(payment.status),
      amount: payment.amount / 100,
      currency: payment.currency.toUpperCase(),
      createdAt: new Date(payment.created_at * 1000),
      updatedAt: new Date(),
    };
  }

  private mapRazorpayStatus(status: string): 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled' {
    const statusMap: Record<string, any> = {
      created: 'pending',
      authorized: 'pending',
      captured: 'succeeded',
      refunded: 'refunded',
      failed: 'failed',
    };

    return statusMap[status] || 'pending';
  }
}
