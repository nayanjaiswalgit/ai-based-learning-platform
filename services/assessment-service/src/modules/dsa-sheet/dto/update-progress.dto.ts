import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ProblemStatus } from './create-problem.dto';

export class UpdateProgressDto {
  @ApiProperty({ enum: ProblemStatus })
  @IsEnum(ProblemStatus)
  status: ProblemStatus;

  @ApiProperty({ example: 'My approach: Use hash map...', required: false })
  @IsOptional()
  @IsString()
  personalNotes?: string;

  @ApiProperty({ example: 3, description: 'Number of attempts', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  attempts?: number;

  @ApiProperty({ example: 85, description: 'Confidence level 0-100', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceLevel?: number;

  @ApiProperty({ example: 1200, description: 'Time taken in seconds', required: false })
  @IsOptional()
  @IsNumber()
  timeTaken?: number;
}
