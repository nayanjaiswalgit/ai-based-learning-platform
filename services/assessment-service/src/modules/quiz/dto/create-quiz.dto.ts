import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @ApiProperty({ example: 'Data Structures Quiz 1' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Test your knowledge of arrays and linked lists', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], example: ['q1', 'q2', 'q3'] })
  @IsArray()
  @IsString({ each: true })
  questionIds: string[];

  @ApiProperty({ example: 1800, description: 'Time limit in seconds (30 minutes)' })
  @IsNumber()
  @Min(60)
  @Max(10800)
  timeLimit: number;

  @ApiProperty({ example: 70, description: 'Passing percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingPercentage?: number;

  @ApiProperty({ example: true, description: 'Randomize question order', required: false })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @ApiProperty({ example: true, description: 'Shuffle answer options', required: false })
  @IsOptional()
  @IsBoolean()
  shuffleAnswers?: boolean;

  @ApiProperty({ example: true, description: 'Show results immediately after submission', required: false })
  @IsOptional()
  @IsBoolean()
  showResultsImmediately?: boolean;

  @ApiProperty({ example: 3, description: 'Maximum attempts allowed', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxAttempts?: number;

  @ApiProperty({ example: 'course-123', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  availableFrom?: Date;

  @ApiProperty({ example: '2025-01-31T23:59:59Z', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  availableUntil?: Date;
}
