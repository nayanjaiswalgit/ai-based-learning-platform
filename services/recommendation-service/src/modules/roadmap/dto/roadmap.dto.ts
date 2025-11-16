import { IsString, IsEnum, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';
import { SkillLevel, LearningGoal } from '@/types';

export class GenerateRoadmapDto {
  @IsString()
  userId: string;

  @IsEnum(LearningGoal)
  goal: LearningGoal;

  @IsEnum(SkillLevel)
  currentSkillLevel: SkillLevel;

  @IsNumber()
  @Min(1)
  @Max(40)
  availableHoursPerWeek: number;

  @IsOptional()
  @IsEnum(['VISUAL', 'READING', 'HANDS_ON', 'MIXED'])
  preferredLearningStyle?: 'VISUAL' | 'READING' | 'HANDS_ON' | 'MIXED';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificInterests?: string[];
}

export class UpdateRoadmapProgressDto {
  @IsString()
  userId: string;

  @IsString()
  roadmapId: string;

  @IsString()
  milestoneId: string;

  @IsString()
  taskId: string;

  @IsOptional()
  completed?: boolean;
}

export class GetRoadmapDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  roadmapId?: string;
}
