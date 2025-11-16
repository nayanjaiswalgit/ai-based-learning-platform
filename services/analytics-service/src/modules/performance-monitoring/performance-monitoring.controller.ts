import { Controller, Get, Post, Body } from '@nestjs/common'
import { PerformanceMonitoringService } from './performance-monitoring.service'

@Controller('performance')
export class PerformanceMonitoringController {
  constructor(
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  @Get('metrics')
  async getMetrics() {
    return this.performanceMonitoringService.getPerformanceMetrics()
  }

  @Post('track-api')
  async trackApiCall(@Body() data: { endpoint: string; duration: number; statusCode: number }) {
    return this.performanceMonitoringService.trackApiCall(data)
  }

  @Post('track-query')
  async trackQuery(@Body() data: { query: string; duration: number }) {
    return this.performanceMonitoringService.trackDatabaseQuery(data)
  }
}
