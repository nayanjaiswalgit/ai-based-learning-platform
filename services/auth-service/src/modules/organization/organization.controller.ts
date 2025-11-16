import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create organization' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  async createOrganization(
    @Body() createOrgDto: any,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.createOrganization(createOrgDto, user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  async getOrganization(@Param('slug') slug: string) {
    return this.organizationService.getOrganizationBySlug(slug);
  }

  @Post(':slug/members')
  @Roles('ADMIN', 'INSTRUCTOR')
  @ApiOperation({ summary: 'Add member to organization' })
  @ApiResponse({ status: 201, description: 'Member added' })
  async addMember(
    @Param('slug') slug: string,
    @Body() addMemberDto: any,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.addMember(slug, addMemberDto.userId, addMemberDto.role);
  }

  @Get(':slug/members')
  @ApiOperation({ summary: 'Get organization members' })
  @ApiResponse({ status: 200, description: 'Members retrieved' })
  async getMembers(@Param('slug') slug: string) {
    return this.organizationService.getMembers(slug);
  }
}
