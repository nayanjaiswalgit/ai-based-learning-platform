import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUrl, IsBoolean, IsObject, MinLength, MaxLength } from 'class-validator';
import { OrganizationType } from '../constants/title-role-mapping';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ description: 'Organization name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: OrganizationType, description: 'Type of organization' })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiPropertyOptional({ description: 'Organization description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Organization website' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional settings (JSON)' })
  @IsOptional()
  @IsObject()
  settings?: any;
}
