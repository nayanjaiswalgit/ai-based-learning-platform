import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '@repo/database';

export class CreateLessonDto {
  @ApiProperty({ example: 'module-uuid-here' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ example: 'Understanding useState Hook' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ContentType, example: ContentType.video })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/video.mp4' })
  @IsString()
  @IsOptional()
  contentUrl?: string;

  @ApiPropertyOptional({ example: 'Lesson content in markdown format...' })
  @IsString()
  @IsOptional()
  contentText?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  durationMinutes?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFreePreview?: boolean;

  @ApiPropertyOptional({ example: 'Video transcript...' })
  @IsString()
  @IsOptional()
  videoTranscript?: string;

  @ApiPropertyOptional({
    example: 'question-uuid-here',
    description: 'ID of the coding lab, terminal challenge, or quiz to associate with this lesson'
  })
  @IsString()
  @IsOptional()
  questionId?: string;
}
