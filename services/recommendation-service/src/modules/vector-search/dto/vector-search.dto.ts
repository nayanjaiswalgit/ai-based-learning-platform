import { IsString, IsOptional, IsNumber, IsArray, IsEnum, Min, Max } from 'class-validator';
import { DifficultyLevel } from '@/types';

export class SearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  topK?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(DifficultyLevel, { each: true })
  difficulty?: DifficultyLevel[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];
}

export class IndexContentDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsString()
  url?: string;
}

export class SimilarContentDto {
  @IsString()
  contentId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class StudentsAlsoTookDto {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number;
}
