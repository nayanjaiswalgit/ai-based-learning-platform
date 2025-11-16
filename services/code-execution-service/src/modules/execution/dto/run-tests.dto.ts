import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SupportedLanguage } from './execute-code.dto';

export class TestCaseDto {
  @ApiProperty({ example: '5' })
  @IsString()
  input: string;

  @ApiProperty({ example: '120' })
  @IsString()
  expectedOutput: string;

  @ApiProperty({ example: 'Factorial of 5', required: false })
  description?: string;
}

export class RunTestsDto {
  @ApiProperty({ example: 'def factorial(n):\n  ...' })
  @IsString()
  code: string;

  @ApiProperty({ enum: SupportedLanguage })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({ type: [TestCaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];

  @ApiProperty({ example: 'problem-123', required: false })
  problemId?: string;
}
