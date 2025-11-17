import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateCodingLabDto {
  @ApiProperty({
    description: 'The topic or subject area for the coding lab',
    example: 'Array Manipulation and Two Pointers',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Difficulty level of the lab',
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    example: 'INTERMEDIATE',
  })
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @ApiProperty({
    description: 'Type of lab to generate',
    enum: ['coding', 'terminal'],
    example: 'coding',
  })
  @IsEnum(['coding', 'terminal'])
  labType: 'coding' | 'terminal';

  @ApiPropertyOptional({
    description: 'Additional context or specific requirements for the lab',
    example: 'Focus on time complexity optimization',
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({
    description: 'Course title for context',
    example: 'Data Structures and Algorithms',
  })
  @IsOptional()
  @IsString()
  courseTitle?: string;

  @ApiPropertyOptional({
    description: 'Module title for context',
    example: 'Arrays and Strings',
  })
  @IsOptional()
  @IsString()
  moduleTitle?: string;
}
