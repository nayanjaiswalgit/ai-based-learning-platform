export interface IPaymentGateway {
  createPayment(params: CreatePaymentParams): Promise<PaymentResponse>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  refundPayment(params: RefundPaymentParams): Promise<RefundResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  userId: string;
  email: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  paymentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  checkoutUrl?: string;
  clientSecret?: string;
}

export interface VerifyPaymentParams {
  paymentId: string;
  orderId?: string;
  signature?: string;
  additionalData?: Record<string, any>;
}

export interface RefundPaymentParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentGatewayType {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
  PAYPAL = 'paypal',
  PADDLE = 'paddle',
}
