import { Controller, Post, Get, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { GenerateRoadmapDto, UpdateRoadmapProgressDto, GetRoadmapDto } from './dto/roadmap.dto';

@Controller('roadmap')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  /**
   * POST /roadmap/generate
   * Generate AI-powered personalized learning roadmap
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateRoadmap(@Body() dto: GenerateRoadmapDto) {
    return this.roadmapService.generateRoadmap(dto);
  }

  /**
   * PUT /roadmap/progress
   * Update task/milestone progress
   */
  @Put('progress')
  @HttpCode(HttpStatus.OK)
  async updateProgress(@Body() dto: UpdateRoadmapProgressDto) {
    return this.roadmapService.updateProgress(dto);
  }

  /**
   * GET /roadmap/:userId
   * Get user's roadmap(s)
   */
  @Get(':userId')
  async getRoadmap(@Param('userId') userId: string, @Query('roadmapId') roadmapId?: string) {
    return this.roadmapService.getRoadmap(userId, roadmapId);
  }
}
