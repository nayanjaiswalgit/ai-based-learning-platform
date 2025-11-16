import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly emailServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.emailServiceUrl = this.configService.get<string>('EMAIL_SERVICE_URL') || 'http://notification-service:3005';
  }

  async sendSubscriptionConfirmation(params: {
    userId: string;
    email: string;
    planName: string;
    amount: number;
    billingCycle: string;
    nextBillingDate: Date;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'subscription_confirmation',
        data: params,
      });
      this.logger.log(`Sent subscription confirmation to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send subscription confirmation: ${error.message}`);
    }
  }

  async sendSubscriptionRenewal(params: {
    userId: string;
    email: string;
    planName: string;
    amount: number;
    renewalDate: Date;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'subscription_renewal',
        data: params,
      });
      this.logger.log(`Sent subscription renewal email to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send subscription renewal: ${error.message}`);
    }
  }

  async sendPaymentSuccess(params: {
    userId: string;
    email: string;
    amount: number;
    currency: string;
    description: string;
    transactionId: string;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'payment_success',
        data: params,
      });
      this.logger.log(`Sent payment success email to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send payment success: ${error.message}`);
    }
  }

  async sendPaymentFailed(params: {
    userId: string;
    email: string;
    amount: number;
    reason: string;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'payment_failed',
        data: params,
      });
      this.logger.log(`Sent payment failed email to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send payment failed: ${error.message}`);
    }
  }

  async sendRefundConfirmation(params: {
    userId: string;
    email: string;
    amount: number;
    currency: string;
    reason: string;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'refund_confirmation',
        data: params,
      });
      this.logger.log(`Sent refund confirmation to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send refund confirmation: ${error.message}`);
    }
  }

  async sendInvoice(params: {
    userId: string;
    email: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    pdfUrl?: string;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'invoice',
        data: params,
      });
      this.logger.log(`Sent invoice to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send invoice: ${error.message}`);
    }
  }

  async sendGiftSubscription(params: {
    recipientEmail: string;
    recipientName: string;
    purchaserName: string;
    giftMessage: string;
    giftCode: string;
    planName: string;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.recipientEmail,
        template: 'gift_subscription',
        data: params,
      });
      this.logger.log(`Sent gift subscription to ${params.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send gift subscription: ${error.message}`);
    }
  }

  async sendTrialEndingReminder(params: {
    userId: string;
    email: string;
    planName: string;
    trialEndDate: Date;
    daysRemaining: number;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'trial_ending',
        data: params,
      });
      this.logger.log(`Sent trial ending reminder to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send trial ending reminder: ${error.message}`);
    }
  }

  async sendPayoutNotification(params: {
    instructorId: string;
    email: string;
    amount: number;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
  }) {
    try {
      await axios.post(`${this.emailServiceUrl}/emails/send`, {
        to: params.email,
        template: 'payout_notification',
        data: params,
      });
      this.logger.log(`Sent payout notification to ${params.email}`);
    } catch (error) {
      this.logger.error(`Failed to send payout notification: ${error.message}`);
    }
  }
}
