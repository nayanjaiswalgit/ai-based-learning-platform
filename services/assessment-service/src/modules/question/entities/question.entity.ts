import { ApiProperty } from '@nestjs/swagger';

export class AnswerOption {
  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty({ required: false })
  explanation?: string;
}

export class Question {
  @ApiProperty()
  id: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  difficulty: string;

  @ApiProperty({ type: [AnswerOption] })
  options: AnswerOption[];

  @ApiProperty({ required: false })
  explanation?: string;

  @ApiProperty({ type: [String], required: false })
  tags?: string[];

  @ApiProperty({ required: false })
  courseId?: string;

  @ApiProperty()
  timeLimit: number;

  @ApiProperty()
  points: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdBy: string;
}
