import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { RazorpayService } from './razorpay.service';
import { PayPalService } from './paypal.service';
import { PaddleService } from './paddle.service';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [PaymentGatewayController],
  providers: [PaymentGatewayService, RazorpayService, PayPalService, PaddleService],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
