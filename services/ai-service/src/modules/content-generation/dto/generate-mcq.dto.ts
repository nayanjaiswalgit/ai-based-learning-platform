import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  TRUE_FALSE = 'TRUE_FALSE',
}

export enum ContentSource {
  COURSE = 'COURSE',
  MODULE = 'MODULE',
  LESSON = 'LESSON',
  CUSTOM_TOPIC = 'CUSTOM_TOPIC',
}

export class GenerateMcqDto {
  @ApiProperty({
    description: 'Type of content source',
    enum: ContentSource,
    example: ContentSource.LESSON,
  })
  @IsEnum(ContentSource)
  contentSource: ContentSource;

  @ApiProperty({
    description: 'ID of the course/module/lesson',
    example: 'course-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  contentId?: string;

  @ApiProperty({
    description: 'Custom topic for MCQ generation',
    example: 'JavaScript Promises and Async/Await',
    required: false,
  })
  @IsOptional()
  @IsString()
  customTopic?: string;

  @ApiProperty({
    description: 'Additional context or content for MCQ generation',
    example: 'Focus on practical examples and real-world scenarios',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalContext?: string;

  @ApiProperty({
    description: 'Number of MCQs to generate',
    example: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(20)
  count: number;

  @ApiProperty({
    description: 'Difficulty level',
    enum: QuestionDifficulty,
    example: QuestionDifficulty.MEDIUM,
  })
  @IsEnum(QuestionDifficulty)
  difficulty: QuestionDifficulty;

  @ApiProperty({
    description: 'Type of questions to generate',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    description: 'Specific topics to focus on',
    example: ['arrays', 'loops', 'functions'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];
}

export class McqOptionDto {
  @ApiProperty({ example: 'Option A text' })
  text: string;

  @ApiProperty({ example: false })
  isCorrect: boolean;

  @ApiProperty({ example: 'Explanation for this option', required: false })
  explanation?: string;
}

export class GeneratedMcqDto {
  @ApiProperty({ example: 'temp-id-123' })
  id: string;

  @ApiProperty({ example: 'What is the time complexity of binary search?' })
  questionText: string;

  @ApiProperty({ type: [McqOptionDto] })
  options: McqOptionDto[];

  @ApiProperty({ enum: QuestionDifficulty, example: QuestionDifficulty.MEDIUM })
  difficulty: QuestionDifficulty;

  @ApiProperty({ enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE })
  questionType: QuestionType;

  @ApiProperty({ example: 'Binary search has O(log n) complexity...' })
  explanation: string;

  @ApiProperty({ example: ['algorithms', 'data-structures'] })
  tags: string[];

  @ApiProperty({ example: 'course-123', required: false })
  courseId?: string;

  @ApiProperty({ example: 'module-456', required: false })
  moduleId?: string;

  @ApiProperty({ example: 'lesson-789', required: false })
  lessonId?: string;
}

export class GenerateMcqResponseDto {
  @ApiProperty({ type: [GeneratedMcqDto] })
  questions: GeneratedMcqDto[];

  @ApiProperty({ example: 'course-123' })
  sourceId?: string;

  @ApiProperty({ enum: ContentSource, example: ContentSource.LESSON })
  sourceType: ContentSource;

  @ApiProperty({ example: 'JavaScript Promises' })
  topic: string;

  @ApiProperty({ example: 5 })
  count: number;
}

export class SaveMcqDto {
  @ApiProperty({ example: 'temp-id-123' })
  @IsString()
  tempId: string;

  @ApiProperty({ example: 'What is the time complexity of binary search?' })
  @IsString()
  questionText: string;

  @ApiProperty({ type: [McqOptionDto] })
  @IsArray()
  options: McqOptionDto[];

  @ApiProperty({ enum: QuestionDifficulty, example: QuestionDifficulty.MEDIUM })
  @IsEnum(QuestionDifficulty)
  difficulty: QuestionDifficulty;

  @ApiProperty({ enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({ example: 'Binary search has O(log n) complexity...' })
  @IsString()
  explanation: string;

  @ApiProperty({ example: ['algorithms', 'data-structures'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

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
