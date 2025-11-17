import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DsaSheetService } from './dsa-sheet.service';
import { CreateProblemDto, ProblemDifficulty, ProblemCategory, ProblemStatus } from './dto/create-problem.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@ApiTags('dsa-sheet')
@Controller('dsa-sheet')
export class DsaSheetController {
  constructor(private readonly dsaSheetService: DsaSheetService) {}

  @Post('problems')
  @ApiOperation({ summary: 'Create a new DSA problem (admin/instructor only)' })
  createProblem(@Body() createProblemDto: CreateProblemDto) {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.createProblem(createProblemDto, userId);
  }

  @Get('problems')
  @ApiOperation({ summary: 'Get all problems with filters' })
  @ApiQuery({ name: 'difficulty', enum: ProblemDifficulty, required: false })
  @ApiQuery({ name: 'category', enum: ProblemCategory, required: false })
  @ApiQuery({ name: 'company', required: false })
  @ApiQuery({ name: 'status', enum: ProblemStatus, required: false })
  getAllProblems(
    @Query('difficulty') difficulty?: ProblemDifficulty,
    @Query('category') category?: ProblemCategory,
    @Query('company') company?: string,
    @Query('status') status?: ProblemStatus,
  ) {
    return this.dsaSheetService.getAllProblems({ difficulty, category, company, status });
  }

  @Get('problems/search')
  @ApiOperation({ summary: 'Search problems by keyword' })
  searchProblems(@Query('q') query: string) {
    return this.dsaSheetService.searchProblems(query);
  }

  @Get('problems/:id')
  @ApiOperation({ summary: 'Get problem details with user progress' })
  getProblem(@Param('id') id: string) {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.getProblemById(id, userId);
  }

  @Patch('problems/:id/progress')
  @ApiOperation({ summary: 'Update problem progress and personal notes' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.updateProgress(id, userId, updateProgressDto);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get user overall progress statistics' })
  getUserProgress() {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.getUserProgress(userId);
  }

  @Get('progress/chart')
  @ApiOperation({ summary: 'Get progress chart data for visualization' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false })
  getProgressChart(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.getProgressChart(userId, period);
  }

  @Get('review')
  @ApiOperation({ summary: 'Get problems due for review (spaced repetition)' })
  getProblemsForReview() {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.getProblemsForReview(userId);
  }

  @Get('stats/companies')
  @ApiOperation({ summary: 'Get company-wise problem statistics' })
  getCompanyStats() {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.getCompanyWiseStats(userId);
  }

  @Post('generate-sheet')
  @ApiOperation({ summary: 'Generate DSA problem sheet using AI' })
  generateDsaSheet(
    @Body()
    dto: {
      targetCompany?: string;
      difficulty: string;
      problemCount: number;
      focusTopics?: string[];
    },
  ) {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.generateDsaSheet({ ...dto, userId });
  }

  @Post('problems/bulk-import')
  @ApiOperation({ summary: 'Bulk import problems from JSON' })
  bulkImportProblems(@Body() dto: { problems: any[] }) {
    const userId = 'user_123'; // Extract from JWT
    return this.dsaSheetService.bulkCreateProblems(dto.problems, userId);
  }

  @Put('problems/:id')
  @ApiOperation({ summary: 'Update a problem' })
  updateProblem(@Param('id') id: string, @Body() updates: Partial<any>) {
    return this.dsaSheetService.updateProblem(id, updates);
  }

  @Delete('problems/:id')
  @ApiOperation({ summary: 'Delete a problem' })
  deleteProblem(@Param('id') id: string) {
    return this.dsaSheetService.deleteProblem(id);
  }
}
