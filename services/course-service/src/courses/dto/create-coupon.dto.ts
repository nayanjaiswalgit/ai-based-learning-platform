import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@repo/database';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: CouponType, example: CouponType.percentage })
  @IsEnum(CouponType)
  couponType: CouponType;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxUses?: number;

  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2024-08-31T23:59:59Z' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['course-id-1', 'course-id-2'], type: [String] })
  @IsArray()
  @IsOptional()
  applicableCourses?: string[];
}
