import { Module } from '@nestjs/common';
import { OneOnOneMeetingController } from './one-on-one-meeting.controller';
import { OneOnOneMeetingService } from './one-on-one-meeting.service';
import { CalendarIntegrationService } from './calendar-integration.service';

@Module({
  controllers: [OneOnOneMeetingController],
  providers: [OneOnOneMeetingService, CalendarIntegrationService],
  exports: [OneOnOneMeetingService],
})
export class OneOnOneMeetingModule {}
