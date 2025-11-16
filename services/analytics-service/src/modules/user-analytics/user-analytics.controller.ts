import { Controller, Get, Param, Query } from '@nestjs/common'
import { UserAnalyticsService } from './user-analytics.service'

@Controller('user-analytics')
export class UserAnalyticsController {
  constructor(private readonly userAnalyticsService: UserAnalyticsService) {}

  @Get(':userId')
  async getUserAnalytics(@Param('userId') userId: string) {
    return this.userAnalyticsService.getUserAnalytics(userId)
  }

  @Get(':userId/streak')
  async getLearningStreak(@Param('userId') userId: string) {
    return this.userAnalyticsService.getLearningStreak(userId)
  }

  @Get(':userId/time-spent')
  async getTimeSpent(
    @Param('userId') userId: string,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.userAnalyticsService.getTimeSpent(userId, period)
  }

  @Get(':userId/courses')
  async getCourseProgress(@Param('userId') userId: string) {
    return this.userAnalyticsService.getCourseProgress(userId)
  }

  @Get(':userId/problems')
  async getProblemsSolved(@Param('userId') userId: string) {
    return this.userAnalyticsService.getProblemsSolved(userId)
  }

  @Get(':userId/skills')
  async getSkillProgression(@Param('userId') userId: string) {
    return this.userAnalyticsService.getSkillProgression(userId)
  }

  @Get(':userId/achievements')
  async getAchievements(@Param('userId') userId: string) {
    return this.userAnalyticsService.getAchievements(userId)
  }
}
