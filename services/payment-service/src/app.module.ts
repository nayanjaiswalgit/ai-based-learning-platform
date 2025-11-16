import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './database/prisma.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PaymentGatewayModule } from './modules/payment-gateway/payment-gateway.module';
import { PppModule } from './modules/ppp/ppp.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { PayoutModule } from './modules/payout/payout.module';
import { DigitalProductModule } from './modules/digital-product/digital-product.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { RefundModule } from './modules/refund/refund.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Bull Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Feature Modules
    SubscriptionModule,
    StripeModule,
    PaymentGatewayModule,
    PppModule,
    CouponModule,
    AffiliateModule,
    PayoutModule,
    DigitalProductModule,
    InvoiceModule,
    RefundModule,
  ],
})
export class AppModule {}
