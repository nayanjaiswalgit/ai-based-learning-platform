import { Module } from '@nestjs/common';
import { BootcampController } from './bootcamp.controller';
import { BootcampService } from './bootcamp.service';
import { ApplicationService } from './application.service';

@Module({
  controllers: [BootcampController],
  providers: [BootcampService, ApplicationService],
  exports: [BootcampService],
})
export class BootcampModule {}
