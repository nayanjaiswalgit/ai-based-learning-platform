import { IsString, IsEnum, IsOptional, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum AnalyticsPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class GetAnalyticsDto {
  @IsString()
  userId: string;

  @IsEnum(AnalyticsPeriod)
  period: AnalyticsPeriod;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

export class RecordActivityDto {
  @IsString()
  userId: string;

  @IsString()
  type: string; // 'COURSE_VIEW', 'PROBLEM_ATTEMPT', 'VIDEO_WATCH', etc.

  @IsString()
  resourceId: string;

  @IsNumber()
  duration: number; // in seconds

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;

  @IsOptional()
  metadata?: any;
}

export class GetStudyPlanDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  weeklyGoalHours?: number;
}

export class PredictSuccessDto {
  @IsString()
  userId: string;

  @IsString()
  problemId: string;
}
