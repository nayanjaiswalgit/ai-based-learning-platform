import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TestCaseService, TestCase } from './test-case.service';

@ApiTags('test-cases')
@Controller('test-cases')
export class TestCaseController {
  constructor(private readonly testCaseService: TestCaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create test case for a problem' })
  create(@Body() body: { problemId: string; testCase: Omit<TestCase, 'id'> }) {
    return this.testCaseService.createTestCase(body.problemId, body.testCase);
  }

  @Get('problem/:problemId')
  @ApiOperation({ summary: 'Get test cases for a problem' })
  getByProblem(
    @Param('problemId') problemId: string,
    @Query('includeHidden') includeHidden?: boolean,
  ) {
    return this.testCaseService.getTestCases(problemId, includeHidden === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test case by ID' })
  getById(@Param('id') id: string) {
    return this.testCaseService.getTestCaseById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update test case' })
  update(@Param('id') id: string, @Body() updates: Partial<TestCase>) {
    return this.testCaseService.updateTestCase(id, updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete test case' })
  delete(@Param('id') id: string) {
    return this.testCaseService.deleteTestCase(id);
  }
}
