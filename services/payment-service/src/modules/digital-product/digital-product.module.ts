import { Module } from '@nestjs/common';
import { DigitalProductService } from './digital-product.service';
import { DigitalProductController } from './digital-product.controller';

@Module({
  controllers: [DigitalProductController],
  providers: [DigitalProductService],
  exports: [DigitalProductService],
})
export class DigitalProductModule {}
