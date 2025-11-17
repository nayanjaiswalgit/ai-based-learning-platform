import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentGenerationService } from './content-generation.service';
import { GenerateCourseDto, RefineCourseContentDto } from './dto/generate-course.dto';

@ApiTags('Content Generation')
@Controller('content-generation')
export class ContentGenerationController {
  constructor(private readonly contentGenerationService: ContentGenerationService) {}

  @Post('generate-course')
  @ApiOperation({
    summary: 'Generate complete course with AI',
    description:
      'Generate a comprehensive course including modules, lessons, quizzes, coding questions, and labs based on a single prompt',
  })
  async generateCourse(@Body() dto: GenerateCourseDto) {
    return this.contentGenerationService.generateCompleteCourse(dto);
  }

  @Post('refine-content')
  @ApiOperation({
    summary: 'Refine course content section',
    description: 'Refine a specific section of the course (module, lesson, quiz, etc.) based on feedback',
  })
  async refineContent(@Body() dto: RefineCourseContentDto) {
    return this.contentGenerationService.refineContent(dto);
  }

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
