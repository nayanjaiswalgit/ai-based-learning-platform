import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AdvancedAssessmentType {
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  DRAG_DROP_CODE = 'DRAG_DROP_CODE',
  CODE_DEBUGGING = 'CODE_DEBUGGING',
  CODE_REVIEW = 'CODE_REVIEW',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
}

export class FillInBlankDto {
  @ApiProperty({ example: 'The time complexity of bubble sort is ___' })
  @IsString()
  text: string;

  @ApiProperty({ type: [String], example: ['O(n^2)', 'O(n*n)'] })
  @IsArray()
  @IsString({ each: true })
  acceptedAnswers: string[];

  @ApiProperty({ example: true, description: 'Case sensitive matching' })
  caseSensitive?: boolean;
}

export class DragDropCodeDto {
  @ApiProperty({ example: 'Arrange the steps to perform a binary search' })
  @IsString()
  question: string;

  @ApiProperty({ type: [String], example: ['Set left = 0', 'Set right = n-1', 'Find mid...'] })
  @IsArray()
  @IsString({ each: true })
  codeBlocks: string[];

  @ApiProperty({ type: [Number], example: [0, 1, 2, 3] })
  @IsArray()
  correctOrder: number[];
}

export class CodeDebuggingDto {
  @ApiProperty({ example: 'Find and fix the bug in this code' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'def factorial(n):\n  return n * factorial(n-1)' })
  @IsString()
  buggyCode: string;

  @ApiProperty({ example: 'python' })
  @IsString()
  language: string;

  @ApiProperty({ type: [String], example: ['Missing base case', 'Will cause stack overflow'] })
  @IsArray()
  @IsString({ each: true })
  expectedIssues: string[];

  @ApiProperty({ example: 'def factorial(n):\n  if n <= 1:\n    return 1\n  return n * factorial(n-1)' })
  @IsString()
  fixedCode: string;
}

export class CodeReviewDto {
  @ApiProperty({ example: 'Review this pull request' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'function processData(data) {...}' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ type: [String], example: ['Performance', 'Security', 'Best Practices'] })
  @IsArray()
  @IsString({ each: true })
  reviewCriteria: string[];

  @ApiProperty({ type: [String], example: ['Use const instead of var', 'Add input validation'] })
  @IsArray()
  @IsString({ each: true })
  expectedComments: string[];
}

export class SystemDesignDto {
  @ApiProperty({ example: 'Design a URL shortener like bit.ly' })
  @IsString()
  question: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  requiredComponents: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  evaluationCriteria: string[];
}

export class CreateAdvancedAssessmentDto {
  @ApiProperty({ example: 'Advanced JavaScript Assessment' })
  @IsString()
  title: string;

  @ApiProperty({ enum: AdvancedAssessmentType })
  @IsEnum(AdvancedAssessmentType)
  type: AdvancedAssessmentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FillInBlankDto)
  fillInBlank?: FillInBlankDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DragDropCodeDto)
  dragDropCode?: DragDropCodeDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeDebuggingDto)
  codeDebugging?: CodeDebuggingDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeReviewDto)
  codeReview?: CodeReviewDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SystemDesignDto)
  systemDesign?: SystemDesignDto;

  @ApiProperty({ example: ['javascript', 'debugging'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
