import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionAnswerDto {
  @ApiProperty({ example: 'q1' })
  @IsString()
  questionId: string;

  @ApiProperty({ type: [String], example: ['option1'] })
  @IsArray()
  @IsString({ each: true })
  selectedAnswers: string[];

  @ApiProperty({ example: 45, description: 'Time spent on this question in seconds' })
  timeSpent?: number;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuestionAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  answers: QuestionAnswerDto[];

  @ApiProperty({ example: 1650, description: 'Total time taken in seconds' })
  totalTime: number;
}
