import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class SendMessageDto {
  @IsString()
  userId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: {
    currentCourse?: string;
    currentProblem?: string;
    currentCode?: string;
    language?: string;
  };
}

export class GetChatHistoryDto {
  @IsString()
  userId: string;

  @IsOptional()
  limit?: number;
}

export class ClearChatHistoryDto {
  @IsString()
  userId: string;
}

export enum HintLevel {
  SUBTLE = 'SUBTLE',
  MODERATE = 'MODERATE',
  DETAILED = 'DETAILED',
}

export class GetHintDto {
  @IsString()
  userId: string;

  @IsString()
  problemId: string;

  @IsOptional()
  @IsString()
  currentCode?: string;

  @IsOptional()
  @IsEnum(HintLevel)
  level?: HintLevel;
}
