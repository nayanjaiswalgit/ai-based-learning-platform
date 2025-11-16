import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LearningPathService } from './learning-path.service';

@ApiTags('Learning Path')
@Controller('learning-path')
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate personalized learning path' })
  async generateLearningPath(@Body() body: { userId: string; goals: string[]; currentLevel: string }) {
    return this.learningPathService.generatePath(body.userId, body.goals, body.currentLevel);
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize existing learning path based on progress' })
  async optimizePath(@Body() body: { userId: string; pathId: string }) {
    return this.learningPathService.optimizePath(body.userId, body.pathId);
  }
}
