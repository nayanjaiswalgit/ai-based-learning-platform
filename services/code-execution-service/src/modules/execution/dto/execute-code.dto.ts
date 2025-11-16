import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';

export enum SupportedLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  JAVA = 'java',
  CPP = 'cpp',
  GO = 'go',
  RUST = 'rust',
  C = 'c',
}

export class ExecuteCodeDto {
  @ApiProperty({ example: 'print("Hello World")' })
  @IsString()
  code: string;

  @ApiProperty({ enum: SupportedLanguage, example: SupportedLanguage.PYTHON })
  @IsEnum(SupportedLanguage)
  language: SupportedLanguage;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  stdin?: string;

  @ApiProperty({ type: [String], example: ['arg1', 'arg2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  args?: string[];

  @ApiProperty({ example: 10, description: 'Time limit in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  timeLimit?: number;

  @ApiProperty({ example: 256, description: 'Memory limit in MB', required: false })
  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(512)
  memoryLimit?: number;

  @ApiProperty({ example: 'problem-123', required: false })
  @IsOptional()
  @IsString()
  problemId?: string;
}
