import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { UserRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({ description: 'User ID to add' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: UserRole, description: 'Core role (STUDENT, INSTRUCTOR, MENTOR, ADMIN)' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ description: 'Custom title (e.g., Dean, Professor, CTO)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Additional permissions (JSON)' })
  @IsOptional()
  @IsObject()
  permissions?: any;
}
