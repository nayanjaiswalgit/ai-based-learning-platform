import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDto, RecordActivityDto, GetStudyPlanDto, PredictSuccessDto } from './dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * POST /analytics
   * Get comprehensive learning analytics
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async getLearningAnalytics(@Body() dto: GetAnalyticsDto) {
    return this.analyticsService.getLearningAnalytics(dto);
  }

  /**
   * POST /analytics/record-activity
   * Record user activity for analytics
   */
  @Post('record-activity')
  @HttpCode(HttpStatus.CREATED)
  async recordActivity(@Body() dto: RecordActivityDto) {
    return this.analyticsService.recordActivity(dto);
  }

  /**
   * POST /analytics/predict-success
   * Predict success probability for a problem
   */
  @Post('predict-success')
  @HttpCode(HttpStatus.OK)
  async predictSuccess(@Body() dto: PredictSuccessDto) {
    return this.analyticsService.predictSuccess(dto);
  }
}
