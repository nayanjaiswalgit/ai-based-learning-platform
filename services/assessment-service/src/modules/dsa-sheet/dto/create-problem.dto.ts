import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

export enum ProblemDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum ProblemCategory {
  ARRAY = 'ARRAY',
  STRING = 'STRING',
  LINKED_LIST = 'LINKED_LIST',
  STACK = 'STACK',
  QUEUE = 'QUEUE',
  TREE = 'TREE',
  GRAPH = 'GRAPH',
  DYNAMIC_PROGRAMMING = 'DYNAMIC_PROGRAMMING',
  GREEDY = 'GREEDY',
  BACKTRACKING = 'BACKTRACKING',
  SORTING = 'SORTING',
  SEARCHING = 'SEARCHING',
  MATH = 'MATH',
  BIT_MANIPULATION = 'BIT_MANIPULATION',
  HEAP = 'HEAP',
  TRIE = 'TRIE',
}

export enum ProblemStatus {
  TODO = 'TODO',
  ATTEMPTED = 'ATTEMPTED',
  SOLVED = 'SOLVED',
  MASTERED = 'MASTERED',
}

export class CreateProblemDto {
  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Given an array of integers...' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ProblemDifficulty, example: ProblemDifficulty.EASY })
  @IsEnum(ProblemDifficulty)
  difficulty: ProblemDifficulty;

  @ApiProperty({ enum: ProblemCategory, isArray: true })
  @IsArray()
  @IsEnum(ProblemCategory, { each: true })
  categories: ProblemCategory[];

  @ApiProperty({ example: ['Google', 'Meta', 'Amazon'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companyTags?: string[];

  @ApiProperty({ example: 'https://leetcode.com/problems/two-sum', required: false })
  @IsOptional()
  @IsUrl()
  externalLink?: string;

  @ApiProperty({ example: 45, description: 'Time limit in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(600)
  timeLimit?: number;

  @ApiProperty({ example: 256, description: 'Memory limit in MB', required: false })
  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(1024)
  memoryLimit?: number;

  @ApiProperty({ example: '# Hints\n1. Try using a hash map', required: false })
  @IsOptional()
  @IsString()
  hints?: string;

  @ApiProperty({ example: '# Solution approach...', required: false })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiProperty({ type: [String], example: ['input1', 'input2'], required: false })
  @IsOptional()
  @IsArray()
  testCases?: any[];
}
