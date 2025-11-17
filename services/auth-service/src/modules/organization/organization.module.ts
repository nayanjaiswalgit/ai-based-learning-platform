import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationPermissionsService } from './organization-permissions.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationPermissionsService, PrismaService],
  exports: [OrganizationService, OrganizationPermissionsService],
})
export class OrganizationModule {}
