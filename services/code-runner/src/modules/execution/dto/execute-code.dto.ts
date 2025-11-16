import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class TestCaseDto {
  @ApiProperty({ description: 'Test input' })
  @IsString()
  input: string;

  @ApiProperty({ description: 'Expected output' })
  @IsString()
  expected: string;
}

export class ExecuteCodeDto {
  @ApiProperty({ description: 'Source code to execute' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Programming language', example: 'javascript' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: 'Test cases', required: false, type: [TestCaseDto] })
  @IsOptional()
  @IsArray()
  testCases?: TestCaseDto[];

  @ApiProperty({ description: 'Time limit in seconds', required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  timeLimit?: number;

  @ApiProperty({ description: 'Memory limit in MB', required: false, default: 256 })
  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(512)
  memoryLimit?: number;
}
