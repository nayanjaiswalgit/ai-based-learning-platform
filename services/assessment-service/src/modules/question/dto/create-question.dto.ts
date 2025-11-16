import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  CODE_OUTPUT = 'CODE_OUTPUT',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class AnswerOptionDto {
  @ApiProperty({ example: 'Option A text' })
  @IsString()
  text: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ example: 'Explanation for this option', required: false })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is the time complexity of binary search?' })
  @IsString()
  questionText: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.MEDIUM })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty({ type: [AnswerOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerOptionDto)
  options: AnswerOptionDto[];

  @ApiProperty({ example: 'Binary search has O(log n) complexity...', required: false })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ example: ['algorithms', 'data-structures'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'course-123', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ example: 60, description: 'Time in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(600)
  timeLimit?: number;

  @ApiProperty({ example: 5, description: 'Points for correct answer', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  points?: number;
}
