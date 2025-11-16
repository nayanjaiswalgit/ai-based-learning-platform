import { Module } from '@nestjs/common';
import { CohortController } from './cohort.controller';
import { CohortService } from './cohort.service';
import { AnnouncementService } from './announcement.service';

@Module({
  controllers: [CohortController],
  providers: [CohortService, AnnouncementService],
  exports: [CohortService],
})
export class CohortModule {}
