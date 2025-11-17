import { Controller, Post, Get, Put, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
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

  /**
   * GET /roadmap/list/:userId
   * List all roadmaps for a user
   */
  @Get('list/:userId')
  @HttpCode(HttpStatus.OK)
  async listRoadmaps(@Param('userId') userId: string) {
    return this.roadmapService.listRoadmaps(userId);
  }

  /**
   * PATCH /roadmap/:roadmapId
   * Update roadmap title, description, or structure
   */
  @Patch(':roadmapId')
  @HttpCode(HttpStatus.OK)
  async updateRoadmap(
    @Param('roadmapId') roadmapId: string,
    @Body() body: { userId: string; updates: any },
  ) {
    return this.roadmapService.updateRoadmap(roadmapId, body.userId, body.updates);
  }

  /**
   * DELETE /roadmap/:roadmapId
   * Delete a roadmap
   */
  @Delete(':roadmapId')
  @HttpCode(HttpStatus.OK)
  async deleteRoadmap(@Param('roadmapId') roadmapId: string, @Body('userId') userId: string) {
    await this.roadmapService.deleteRoadmap(roadmapId, userId);
    return { message: 'Roadmap deleted successfully' };
  }
}
