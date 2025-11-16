import { Controller, Get, Query } from '@nestjs/common'
import { AdminAnalyticsService } from './admin-analytics.service'

@Controller('admin-analytics')
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('platform-metrics')
  async getPlatformMetrics() {
    return this.adminAnalyticsService.getPlatformMetrics()
  }

  @Get('revenue-metrics')
  async getRevenueMetrics() {
    return this.adminAnalyticsService.getRevenueMetrics()
  }

  @Get('content-metrics')
  async getContentMetrics(@Query('limit') limit?: number) {
    return this.adminAnalyticsService.getContentMetrics(limit)
  }

  @Get('dashboard')
  async getAdminDashboard() {
    return this.adminAnalyticsService.getAdminDashboard()
  }
}
