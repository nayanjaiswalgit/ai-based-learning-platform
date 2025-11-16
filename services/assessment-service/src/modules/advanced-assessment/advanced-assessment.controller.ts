import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdvancedAssessmentService } from './advanced-assessment.service';
import { CreateAdvancedAssessmentDto, AdvancedAssessmentType } from './dto/create-advanced-assessment.dto';

@ApiTags('advanced-assessments')
@Controller('advanced-assessments')
export class AdvancedAssessmentController {
  constructor(private readonly advancedAssessmentService: AdvancedAssessmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create advanced assessment' })
  create(@Body() createDto: CreateAdvancedAssessmentDto) {
    const userId = 'user_123';
    return this.advancedAssessmentService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all advanced assessments' })
  findAll(@Query('type') type?: AdvancedAssessmentType) {
    return this.advancedAssessmentService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID' })
  findOne(@Param('id') id: string) {
    return this.advancedAssessmentService.findOne(id);
  }

  @Post(':id/evaluate/fill-in-blank')
  @ApiOperation({ summary: 'Evaluate fill-in-the-blank answer' })
  evaluateFillInBlank(
    @Param('id') id: string,
    @Body() body: { answer: string },
  ) {
    return this.advancedAssessmentService.evaluateFillInBlank(id, body.answer);
  }

  @Post(':id/evaluate/drag-drop')
  @ApiOperation({ summary: 'Evaluate drag-drop code ordering' })
  evaluateDragDrop(
    @Param('id') id: string,
    @Body() body: { order: number[] },
  ) {
    return this.advancedAssessmentService.evaluateDragDropCode(id, body.order);
  }

  @Post(':id/evaluate/debugging')
  @ApiOperation({ summary: 'Evaluate code debugging submission' })
  evaluateDebugging(
    @Param('id') id: string,
    @Body() body: { code: string; issues: string[] },
  ) {
    return this.advancedAssessmentService.evaluateCodeDebugging(id, body.code, body.issues);
  }

  @Post(':id/evaluate/code-review')
  @ApiOperation({ summary: 'Evaluate code review comments' })
  evaluateCodeReview(
    @Param('id') id: string,
    @Body() body: { comments: string[] },
  ) {
    return this.advancedAssessmentService.evaluateCodeReview(id, body.comments);
  }

  @Post(':id/evaluate/system-design')
  @ApiOperation({ summary: 'Evaluate system design answer' })
  evaluateSystemDesign(
    @Param('id') id: string,
    @Body() body: { answer: string },
  ) {
    return this.advancedAssessmentService.evaluateSystemDesign(id, body.answer);
  }
}
