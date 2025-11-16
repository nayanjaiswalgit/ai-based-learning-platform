import { IsString, IsNumber, IsOptional, IsBoolean, IsJSON, IsEnum, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

class WeekModule {
  @ApiProperty()
  @IsNumber()
  week: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  topics: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learningObjectives?: string;
}

export class CreateBootcampDto {
  @ApiProperty({ description: 'Bootcamp title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Bootcamp description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Duration in weeks', minimum: 1, maximum: 52 })
  @IsNumber()
  @Min(1)
  @Max(52)
  durationWeeks: number;

  @ApiProperty({ description: 'Week-by-week syllabus', type: [WeekModule] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekModule)
  syllabus: WeekModule[];

  @ApiProperty({ description: 'Instructor user ID' })
  @IsString()
  instructorId: string;

  @ApiProperty({ description: 'Bootcamp price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Maximum students per cohort', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxStudentsPerCohort?: number;

  @ApiProperty({ description: 'Difficulty level', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;

  @ApiPropertyOptional({ description: 'Thumbnail image URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Is bootcamp published', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
