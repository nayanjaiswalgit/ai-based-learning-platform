import { Module } from '@nestjs/common';
import { PppService } from './ppp.service';
import { PppController } from './ppp.controller';

@Module({
  controllers: [PppController],
  providers: [PppService],
  exports: [PppService],
})
export class PppModule {}
