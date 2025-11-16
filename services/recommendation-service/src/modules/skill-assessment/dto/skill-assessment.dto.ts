import { IsString, IsEnum, IsArray, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { SkillLevel, LearningGoal, DifficultyLevel } from '@/types';

export class CreateAssessmentDto {
  @IsString()
  userId: string;

  @IsEnum(LearningGoal)
  goal: LearningGoal;

  @IsOptional()
  @IsEnum(SkillLevel)
  estimatedLevel?: SkillLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];
}

export class SubmitAssessmentAnswerDto {
  @IsString()
  userId: string;

  @IsString()
  assessmentId: string;

  @IsString()
  questionId: string;

  @IsNumber()
  @Min(0)
  @Max(3)
  selectedAnswer: number;
}

export class GetSkillGapsDto {
  @IsString()
  userId: string;

  @IsEnum(LearningGoal)
  targetGoal: LearningGoal;
}

export class GenerateQuestionsDto {
  @IsEnum(LearningGoal)
  goal: LearningGoal;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsNumber()
  @Min(5)
  @Max(50)
  count: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];
}
