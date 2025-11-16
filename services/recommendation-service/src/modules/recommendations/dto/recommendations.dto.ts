import { IsString, IsEnum, IsOptional, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDailyRecommendationsDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}

export class UpdateStreakDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  streakCount?: number;
}

export class SubmitChallengeDto {
  @IsString()
  userId: string;

  @IsString()
  challengeId: string;

  @IsOptional()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  timeTaken?: number; // in seconds
}
