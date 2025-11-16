import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';
import { PaymentGatewayType } from '../payment-gateway/payment-gateway.interface';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private prisma: PrismaService,
    private paymentGatewayService: PaymentGatewayService,
  ) {}

  async requestRefund(data: {
    transactionId: string;
    userId: string;
    amount?: number;
    reason: string;
    reasonDetails?: string;
  }) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: data.transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const refund = await this.prisma.refund.create({
      data: {
        transactionId: data.transactionId,
        userId: data.userId,
        amount: data.amount || transaction.amount,
        currency: transaction.currency,
        reason: data.reason,
        reasonDetails: data.reasonDetails,
        status: 'pending',
      },
    });

    this.logger.log(`Refund requested: ${refund.id}`);
    return refund;
  }

  async processRefund(refundId: string, processedBy: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new Error('Refund not found');
    }

    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: refund.transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    try {
      const gatewayRefund = await this.paymentGatewayService.refundPayment(
        transaction.paymentGateway as PaymentGatewayType,
        {
          paymentId: transaction.stripePaymentIntentId || transaction.razorpayPaymentId || '',
          amount: refund.amount.toNumber(),
          reason: refund.reason,
        },
      );

      await this.prisma.refund.update({
        where: { id: refundId },
        data: {
          status: 'completed',
          processedBy,
          processedAt: new Date(),
          completedAt: new Date(),
          stripeRefundId: gatewayRefund.refundId,
        },
      });

      this.logger.log(`Refund processed: ${refundId}`);
    } catch (error) {
      await this.prisma.refund.update({
        where: { id: refundId },
        data: {
          status: 'rejected',
          processedBy,
          processedAt: new Date(),
        },
      });

      this.logger.error(`Refund failed: ${refundId} - ${error.message}`);
      throw error;
    }
  }

  async getRefundHistory(userId: string) {
    return this.prisma.refund.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
