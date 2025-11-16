import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentGenerationService } from './content-generation.service';

@ApiTags('Content Generation')
@Controller('content-generation')
export class ContentGenerationController {
  constructor(private readonly contentGenerationService: ContentGenerationService) {}

  @Post('generate-quiz')
  @ApiOperation({ summary: 'Generate quiz questions for a topic' })
  async generateQuiz(@Body() body: { topic: string; difficulty: string; count: number }) {
    return this.contentGenerationService.generateQuiz(body.topic, body.difficulty, body.count);
  }

  @Post('generate-explanation')
  @ApiOperation({ summary: 'Generate explanation for a concept' })
  async generateExplanation(@Body() body: { concept: string; level: string }) {
    return this.contentGenerationService.generateExplanation(body.concept, body.level);
  }
}
