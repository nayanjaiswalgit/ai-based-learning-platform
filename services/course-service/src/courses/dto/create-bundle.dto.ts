import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBundleDto {
  @ApiProperty({ example: 'Full Stack Developer Bundle' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Complete package for aspiring full stack developers' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: ['course-id-1', 'course-id-2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  courseIds: string[];
}
