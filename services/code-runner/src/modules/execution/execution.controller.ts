import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@ApiTags('Code Execution')
@Controller('execution')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('run')
  @ApiOperation({ summary: 'Execute code in a sandboxed environment' })
  @ApiResponse({ status: 200, description: 'Code executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid code or language' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async executeCode(@Body() executeCodeDto: ExecuteCodeDto) {
    return this.executionService.executeCode(executeCodeDto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate code without executing' })
  async validateCode(@Body() executeCodeDto: ExecuteCodeDto) {
    return this.executionService.validateCode(executeCodeDto);
  }
}
