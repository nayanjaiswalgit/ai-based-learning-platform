import { Controller, Get, Param, Query } from '@nestjs/common'
import { InstructorAnalyticsService } from './instructor-analytics.service'

@Controller('instructor-analytics')
export class InstructorAnalyticsController {
  constructor(private readonly instructorAnalyticsService: InstructorAnalyticsService) {}

  @Get(':instructorId/courses/:courseId/performance')
  async getCoursePerformance(
    @Param('instructorId') instructorId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.instructorAnalyticsService.getCoursePerformance(instructorId, courseId)
  }

  @Get(':instructorId/revenue')
  async getRevenue(@Param('instructorId') instructorId: string) {
    return this.instructorAnalyticsService.getRevenue(instructorId)
  }

  @Get(':instructorId/courses/:courseId/engagement')
  async getStudentEngagement(
    @Param('instructorId') instructorId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.instructorAnalyticsService.getStudentEngagement(courseId)
  }

  @Get(':instructorId/dashboard')
  async getDashboard(@Param('instructorId') instructorId: string) {
    return this.instructorAnalyticsService.getInstructorDashboard(instructorId)
  }
}
