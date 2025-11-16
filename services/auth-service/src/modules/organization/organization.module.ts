import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, PrismaService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
