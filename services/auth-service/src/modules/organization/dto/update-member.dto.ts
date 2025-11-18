import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID, IsBoolean, IsObject } from 'class-validator';
import { UserRole } from '../constants/title-role-mapping';

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: UserRole, description: 'Core role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Custom title' })
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

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
