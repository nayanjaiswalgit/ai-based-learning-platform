import {
  Controller,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { RunTestsDto } from './dto/run-tests.dto';

@ApiTags('code-execution')
@Controller('execute')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  @ApiOperation({ summary: 'Execute code in sandbox' })
  executeCode(@Body() executeCodeDto: ExecuteCodeDto) {
    const userId = 'user_123'; // Extract from JWT
    return this.executionService.executeCode(executeCodeDto, userId);
  }

  @Post('test')
  @ApiOperation({ summary: 'Run code against test cases' })
  runTests(@Body() runTestsDto: RunTestsDto) {
    const userId = 'user_123'; // Extract from JWT
    return this.executionService.runTests(runTestsDto, userId);
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get execution status' })
  getStatus(@Param('jobId') jobId: string) {
    return this.executionService.getExecutionStatus(jobId);
  }
}
