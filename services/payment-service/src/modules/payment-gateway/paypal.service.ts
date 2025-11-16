import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
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
export class PayPalService implements IPaymentGateway {
  private client: any;
  private readonly logger = new Logger(PayPalService.name);

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE') || 'sandbox';

    if (clientId && clientSecret) {
      const environment =
        mode === 'production'
          ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
          : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

      this.client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
      this.logger.log(`✅ PayPal initialized successfully (${mode} mode)`);
    } else {
      this.logger.warn('⚠️ PayPal credentials not configured');
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
          description: params.description || 'Payment',
          custom_id: params.userId,
        },
      ],
      application_context: {
        brand_name: 'AI Learning Platform',
        user_action: 'PAY_NOW',
      },
    });

    const response = await this.client.execute(request);
    const order = response.result;

    this.logger.log(`Created PayPal order: ${order.id}`);

    // Get approval URL
    const approveLink = order.links.find((link: any) => link.rel === 'approve');

    return {
      paymentId: '',
      orderId: order.id,
      amount: params.amount,
      currency: params.currency,
      status: order.status,
      gateway: PaymentGatewayType.PAYPAL,
      checkoutUrl: approveLink?.href,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersGetRequest(params.orderId!);
      const response = await this.client.execute(request);
      const order = response.result;

      const isCompleted = order.status === 'COMPLETED';

      if (isCompleted) {
        this.logger.log(`PayPal payment verified: ${params.orderId}`);
      } else {
        this.logger.error(`PayPal payment not completed: ${params.orderId}`);
      }

      return isCompleted;
    } catch (error) {
      this.logger.error(`Error verifying PayPal payment: ${error.message}`);
      return false;
    }
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundResponse> {
    // PayPal refunds require capture ID, not order ID
    // This is a simplified implementation
    const request = {
      amount: params.amount
        ? {
            value: params.amount.toFixed(2),
            currency_code: 'USD',
          }
        : undefined,
      note_to_payer: params.reason,
    };

    // Note: This is a placeholder. Actual implementation would need the capture ID
    this.logger.log(`Creating PayPal refund for payment: ${params.paymentId}`);

    return {
      refundId: `refund_${Date.now()}`,
      amount: params.amount || 0,
      currency: 'USD',
      status: 'pending',
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(paymentId);
    const response = await this.client.execute(request);
    const order = response.result;

    return {
      paymentId: order.id,
      status: this.mapPayPalStatus(order.status),
      amount: parseFloat(order.purchase_units[0].amount.value),
      currency: order.purchase_units[0].amount.currency_code,
      createdAt: new Date(order.create_time),
      updatedAt: new Date(order.update_time),
    };
  }

  private mapPayPalStatus(status: string): 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled' {
    const statusMap: Record<string, any> = {
      CREATED: 'pending',
      SAVED: 'pending',
      APPROVED: 'pending',
      COMPLETED: 'succeeded',
      VOIDED: 'cancelled',
    };

    return statusMap[status] || 'pending';
  }

  async captureOrder(orderId: string): Promise<any> {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await this.client.execute(request);
    this.logger.log(`Captured PayPal order: ${orderId}`);

    return response.result;
  }
}
