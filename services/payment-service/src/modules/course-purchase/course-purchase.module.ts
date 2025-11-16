import { Module } from '@nestjs/common';
import { CoursePurchaseService } from './course-purchase.service';
import { CoursePurchaseController } from './course-purchase.controller';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { CouponModule } from '../coupon/coupon.module';
import { AffiliateModule } from '../affiliate/affiliate.module';
import { PayoutModule } from '../payout/payout.module';

@Module({
  imports: [PaymentGatewayModule, CouponModule, AffiliateModule, PayoutModule],
  controllers: [CoursePurchaseController],
  providers: [CoursePurchaseService],
  exports: [CoursePurchaseService],
})
export class CoursePurchaseModule {}
