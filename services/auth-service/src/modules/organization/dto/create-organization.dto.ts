import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUrl, IsBoolean, IsObject, MinLength, MaxLength, Matches } from 'class-validator';
import { OrganizationType } from '../constants/title-role-mapping';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiProperty({ enum: OrganizationType, description: 'Type of organization' })
  @IsEnum(OrganizationType)
  type: OrganizationType;

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

  @ApiPropertyOptional({ description: 'Additional settings (JSON)' })
  @IsOptional()
  @IsObject()
  settings?: any;
}
