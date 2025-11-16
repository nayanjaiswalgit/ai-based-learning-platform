import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel } from '@repo/database';

export class CreateCourseDto {
  @ApiProperty({ example: 'Full Stack Web Development with React and Node.js' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Learn to build modern web applications from scratch' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'This comprehensive course covers...' })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  @IsNotEmpty()
  instructorId: string;

  @ApiPropertyOptional({ enum: DifficultyLevel, example: DifficultyLevel.intermediate })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @ApiPropertyOptional({ example: 40.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedDurationHours?: number;

  @ApiPropertyOptional({ example: 99.99 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/preview.mp4' })
  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: ['react', 'nodejs', 'mongodb'], type: [String] })
  @IsArray()
  @IsOptional()
  skillIds?: string[];
}
