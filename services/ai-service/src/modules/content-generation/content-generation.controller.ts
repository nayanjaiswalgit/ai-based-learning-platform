import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContentGenerationService } from './content-generation.service';
import {
  GenerateMcqDto,
  GenerateMcqResponseDto,
} from './dto/generate-mcq.dto';

@ApiTags('Content Generation')
@Controller('content-generation')
@ApiBearerAuth()
export class ContentGenerationController {
  constructor(private readonly contentGenerationService: ContentGenerationService) {}

  @Post('mcq/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate MCQs using AI based on course/module/lesson content',
    description: `Generate multiple-choice questions using AI based on specific course content.

    Supports generating MCQs from:
    - LESSON: Generate questions from a specific lesson's content
    - MODULE: Generate questions covering all lessons in a module
    - COURSE: Generate questions covering the entire course
    - CUSTOM_TOPIC: Generate questions for a custom topic

    The AI will analyze the content and create relevant questions with explanations.`,
  })
  @ApiResponse({
    status: 200,
    description: 'MCQs generated successfully',
    type: GenerateMcqResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Content source not found',
  })
  async generateMcqs(@Body() dto: GenerateMcqDto): Promise<GenerateMcqResponseDto> {
    return this.contentGenerationService.generateMcqs(dto);
  }

  @Post('generate-quiz')
  @ApiOperation({
    summary: 'Generate quiz questions for a topic (Legacy)',
    description: 'Legacy endpoint for backward compatibility. Use /mcq/generate instead.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz questions generated',
  })
  async generateQuiz(@Body() body: { topic: string; difficulty: string; count: number }) {
    return this.contentGenerationService.generateQuiz(body.topic, body.difficulty, body.count);
  }

  @Post('generate-explanation')
  @ApiOperation({
    summary: 'Generate AI explanation for a concept',
    description: 'Generate a clear, level-appropriate explanation of a concept using AI.',
  })
  @ApiResponse({
    status: 200,
    description: 'Explanation generated successfully',
  })
  async generateExplanation(
    @Body() body: { concept: string; level: string },
  ): Promise<{ concept: string; level: string; explanation: string }> {
    return this.contentGenerationService.generateExplanation(body.concept, body.level);
  }
}
