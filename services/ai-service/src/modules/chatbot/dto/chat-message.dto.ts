import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'User message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Additional context', required: false })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
