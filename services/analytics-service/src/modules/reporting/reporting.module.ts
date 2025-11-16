import { Module } from '@nestjs/common'
import { ReportingController } from './reporting.controller'
import { ReportingService } from './reporting.service'
import { UserAnalyticsModule } from '../user-analytics/user-analytics.module'
import { InstructorAnalyticsModule } from '../instructor-analytics/instructor-analytics.module'

@Module({
  imports: [UserAnalyticsModule, InstructorAnalyticsModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
