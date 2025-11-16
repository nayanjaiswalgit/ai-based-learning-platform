import { IsString, IsOptional, IsUrl, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty()
  @IsString()
  answerText: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  fileUrl?: string;
}

export class ApplyBootcampDto {
  @ApiProperty({ description: 'Bootcamp ID to apply for' })
  @IsString()
  bootcampId: string;

  @ApiProperty({ description: 'Motivation letter' })
  @IsString()
  motivationLetter: string;

  @ApiPropertyOptional({ description: 'Resume URL' })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'GitHub profile URL' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ description: 'Portfolio URL' })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiPropertyOptional({ description: 'Screening question answers', type: [AnswerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];
}
