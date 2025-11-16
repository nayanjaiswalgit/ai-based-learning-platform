import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { SkillAssessmentService } from './skill-assessment.service';
import {
  CreateAssessmentDto,
  SubmitAssessmentAnswerDto,
  GetSkillGapsDto,
  GenerateQuestionsDto,
} from './dto/skill-assessment.dto';

@Controller('skill-assessment')
export class SkillAssessmentController {
  constructor(private readonly skillAssessmentService: SkillAssessmentService) {}

  /**
   * POST /skill-assessment/create
   * Create a new skill assessment with AI-generated questions
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createAssessment(@Body() dto: CreateAssessmentDto) {
    return this.skillAssessmentService.createAssessment(dto);
  }

  /**
   * POST /skill-assessment/generate-questions
   * Generate AI-powered assessment questions
   */
  @Post('generate-questions')
  @HttpCode(HttpStatus.OK)
  async generateQuestions(@Body() dto: GenerateQuestionsDto) {
    return this.skillAssessmentService.generateQuestions(dto);
  }

  /**
   * POST /skill-assessment/submit-answer
   * Submit an answer to a question
   */
  @Post('submit-answer')
  @HttpCode(HttpStatus.OK)
  async submitAnswer(@Body() dto: SubmitAssessmentAnswerDto) {
    return this.skillAssessmentService.submitAnswer(dto);
  }

  /**
   * GET /skill-assessment/results/:userId/:assessmentId
   * Get assessment results with skill level calculation
   */
  @Get('results/:userId/:assessmentId')
  async getResults(@Param('userId') userId: string, @Param('assessmentId') assessmentId: string) {
    return this.skillAssessmentService.calculateSkillLevel(userId, assessmentId);
  }

  /**
   * POST /skill-assessment/skill-gaps
   * Analyze skill gaps for a user
   */
  @Post('skill-gaps')
  @HttpCode(HttpStatus.OK)
  async analyzeSkillGaps(@Body() dto: GetSkillGapsDto) {
    return this.skillAssessmentService.analyzeSkillGaps(dto);
  }
}
