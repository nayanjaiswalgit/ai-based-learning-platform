import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  create(@Body() createQuizDto: CreateQuizDto) {
    const userId = 'user_123'; // Extract from JWT
    return this.quizService.create(createQuizDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  findAll(@Query('courseId') courseId?: string) {
    return this.quizService.findAll({ courseId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz details' })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a quiz attempt' })
  startAttempt(@Param('id') id: string) {
    const userId = 'user_123'; // Extract from JWT
    return this.quizService.startQuizAttempt(id, userId);
  }

  @Post('attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Submit quiz answers for auto-grading' })
  submitQuiz(
    @Param('attemptId') attemptId: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    const userId = 'user_123'; // Extract from JWT
    return this.quizService.submitQuiz(attemptId, submitQuizDto, userId);
  }

  @Get('attempts/:attemptId/results')
  @ApiOperation({ summary: 'Get results for a quiz attempt' })
  getResults(@Param('attemptId') attemptId: string) {
    const userId = 'user_123'; // Extract from JWT
    return this.quizService.getAttemptResults(attemptId, userId);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get user attempt history for a quiz' })
  getAttemptHistory(@Param('id') id: string) {
    const userId = 'user_123'; // Extract from JWT
    return this.quizService.getUserAttemptHistory(id, userId);
  }
}
