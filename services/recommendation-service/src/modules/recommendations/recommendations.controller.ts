import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { GetDailyRecommendationsDto, UpdateStreakDto, SubmitChallengeDto } from './dto/recommendations.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * POST /recommendations/daily
   * Get daily personalized recommendations
   */
  @Post('daily')
  @HttpCode(HttpStatus.OK)
  async getDailyRecommendations(@Body() dto: GetDailyRecommendationsDto) {
    return this.recommendationsService.getDailyRecommendations(dto);
  }

  /**
   * POST /recommendations/streak
   * Update user learning streak
   */
  @Post('streak')
  @HttpCode(HttpStatus.OK)
  async updateStreak(@Body() dto: UpdateStreakDto) {
    return this.recommendationsService.updateStreak(dto);
  }

  /**
   * POST /recommendations/submit-challenge
   * Submit daily challenge completion
   */
  @Post('submit-challenge')
  @HttpCode(HttpStatus.OK)
  async submitChallenge(@Body() dto: SubmitChallengeDto) {
    return this.recommendationsService.submitChallenge(dto);
  }
}
