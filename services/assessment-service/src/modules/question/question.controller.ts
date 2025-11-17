import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    // In production, extract userId from JWT token
    const userId = 'user_123';
    return this.questionService.create(createQuestionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions with optional filters' })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  findAll(
    @Query('difficulty') difficulty?: string,
    @Query('type') type?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.questionService.findAll({ difficulty, type, courseId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by ID' })
  findOne(@Param('id') id: string, @Query('shuffle') shuffle?: boolean) {
    const question = this.questionService.findOne(id);
    if (shuffle) {
      return this.questionService.shuffleOptions(question);
    }
    return question;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a question' })
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question' })
  remove(@Param('id') id: string) {
    return this.questionService.remove(id);
  }

  @Post(':id/check-answer')
  @ApiOperation({ summary: 'Check answer and get instant feedback' })
  checkAnswer(
    @Param('id') id: string,
    @Body() body: { selectedAnswers: string[] },
  ) {
    return this.questionService.checkAnswer(id, body.selectedAnswers);
  }

  @Post('from-ai-generation')
  @ApiOperation({ summary: 'Create a question from AI-generated content' })
  createFromAIGeneration(@Body() body: {
    generatedContent: any;
    labType: 'coding' | 'terminal';
    createdBy?: string;
  }) {
    return this.questionService.createFromAIGeneration(
      body.generatedContent,
      body.labType,
      body.createdBy,
    );
  }
}
