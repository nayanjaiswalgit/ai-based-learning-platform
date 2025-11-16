import { Module } from '@nestjs/common'
import { InstructorAnalyticsController } from './instructor-analytics.controller'
import { InstructorAnalyticsService } from './instructor-analytics.service'

@Module({
  controllers: [InstructorAnalyticsController],
  providers: [InstructorAnalyticsService],
  exports: [InstructorAnalyticsService],
})
export class InstructorAnalyticsModule {}
