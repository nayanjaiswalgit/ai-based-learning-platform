import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class GenerateCourseDto {
  @ApiProperty({
    description: 'Detailed prompt describing the course to generate',
    example:
      'Create a comprehensive Python programming course for beginners. Include basics, data structures, OOP, and practical projects.',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Target difficulty level',
    enum: CourseDifficulty,
    default: CourseDifficulty.BEGINNER,
  })
  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @ApiPropertyOptional({
    description: 'Estimated duration in hours',
    example: 40,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Number of modules to generate',
    example: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  moduleCount?: number;
}

export class RefineCourseContentDto {
  @ApiProperty({
    description: 'Section type to refine',
    enum: ['course', 'module', 'lesson', 'quiz', 'coding-question', 'terminal-lab'],
  })
  @IsString()
  sectionType: string;

  @ApiProperty({
    description: 'Section identifier (e.g., module index, lesson index)',
    example: '0',
  })
  @IsString()
  sectionId: string;

  @ApiProperty({
    description: 'Refinement instructions',
    example: 'Make this module more beginner-friendly with more examples',
  })
  @IsString()
  refinementPrompt: string;

  @ApiProperty({
    description: 'Current content to refine',
  })
  currentContent: any;
}
