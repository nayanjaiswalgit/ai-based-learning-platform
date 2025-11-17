import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Department description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Head member ID (OrganizationMember ID)' })
  @IsOptional()
  @IsUUID()
  headMemberId?: string;
}
