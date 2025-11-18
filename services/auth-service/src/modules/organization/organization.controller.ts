import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { OrganizationPermissionsService } from './organization-permissions.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberDto,
  CreateDepartmentDto,
} from './dto';
import { UserRole } from './constants/title-role-mapping';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly permissionsService: OrganizationPermissionsService,
  ) {}

  // =====================================================
  // ORGANIZATION CRUD
  // =====================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.createOrganization(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully' })
  async getAllOrganizations(
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.organizationService.getAllOrganizations({
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('my-organizations')
  @ApiOperation({ summary: 'Get current user organizations' })
  @ApiResponse({ status: 200, description: 'User organizations retrieved' })
  async getMyOrganizations(@CurrentUser() user: any) {
    return this.organizationService.getUserOrganizations(user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganization(@Param('slug') slug: string) {
    return this.organizationService.getOrganizationBySlug(slug);
  }

  @Put(':slug')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async updateOrganization(
    @Param('slug') slug: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.updateOrganization(slug, dto, user.id);
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Creator only' })
  async deleteOrganization(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.deleteOrganization(slug, user.id);
  }

  // =====================================================
  // MEMBER MANAGEMENT
  // =====================================================

  @Post(':slug/members')
  @ApiOperation({ summary: 'Add member to organization' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async addMember(
    @Param('slug') slug: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.addMember(slug, dto, user.id);
  }

  @Get(':slug/members')
  @ApiOperation({ summary: 'Get organization members' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Members retrieved' })
  async getMembers(
    @Param('slug') slug: string,
    @Query('role') role?: UserRole,
    @Query('departmentId') departmentId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.organizationService.getMembers(slug, {
      role,
      departmentId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Put('members/:memberId')
  @ApiOperation({ summary: 'Update member details' })
  @ApiResponse({ status: 200, description: 'Member updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.updateMember(memberId, dto, user.id);
  }

  @Delete('members/:memberId')
  @ApiOperation({ summary: 'Remove member from organization' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async removeMember(
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.removeMember(memberId, user.id);
  }

  // =====================================================
  // DEPARTMENT MANAGEMENT
  // =====================================================

  @Post(':slug/departments')
  @ApiOperation({ summary: 'Create department' })
  @ApiResponse({ status: 201, description: 'Department created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createDepartment(
    @Param('slug') slug: string,
    @Body() dto: CreateDepartmentDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.createDepartment(slug, dto, user.id);
  }

  @Get(':slug/departments')
  @ApiOperation({ summary: 'Get organization departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved' })
  async getDepartments(@Param('slug') slug: string) {
    return this.organizationService.getDepartments(slug);
  }

  @Put('departments/:departmentId')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'Department updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async updateDepartment(
    @Param('departmentId') departmentId: string,
    @Body() dto: Partial<CreateDepartmentDto>,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.updateDepartment(departmentId, dto, user.id);
  }

  @Delete('departments/:departmentId')
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async deleteDepartment(
    @Param('departmentId') departmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationService.deleteDepartment(departmentId, user.id);
  }

  // =====================================================
  // MENTOR DISCOVERY
  // =====================================================

  @Get(':slug/mentors')
  @ApiOperation({ summary: 'Get mentors in organization' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiResponse({ status: 200, description: 'Mentors retrieved' })
  async getMentors(
    @Param('slug') slug: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.organizationService.getMentorsInOrganization(slug, {
      departmentId,
    });
  }

  // =====================================================
  // CAPABILITIES & PERMISSIONS
  // =====================================================

  @Get(':slug/capabilities')
  @ApiOperation({ summary: 'Get organization capabilities and user permissions' })
  @ApiResponse({ status: 200, description: 'Capabilities retrieved' })
  async getCapabilities(
    @Param('slug') slug: string,
    @CurrentUser() user: any,
  ) {
    const organization = await this.organizationService.getOrganizationBySlug(slug);
    return this.permissionsService.getOrganizationCapabilities(organization.id, user?.id);
  }

  @Get(':slug/suggested-titles')
  @ApiOperation({ summary: 'Get suggested titles for organization type' })
  @ApiResponse({ status: 200, description: 'Suggested titles retrieved' })
  async getSuggestedTitles(@Param('slug') slug: string) {
    const organization = await this.organizationService.getOrganizationBySlug(slug);
    const { getSuggestedTitles } = await import('./constants/title-role-mapping');
    return {
      titles: getSuggestedTitles(organization.type),
    };
  }
}
