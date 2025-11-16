import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BootcampService } from './bootcamp.service';
import { ApplicationService } from './application.service';
import { CreateBootcampDto } from './dto/create-bootcamp.dto';
import { ApplyBootcampDto } from './dto/apply-bootcamp.dto';

@ApiTags('Bootcamps')
@Controller('bootcamps')
export class BootcampController {
  constructor(
    private bootcampService: BootcampService,
    private applicationService: ApplicationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new bootcamp (instructor only)' })
  @ApiBearerAuth()
  async create(@Body() dto: CreateBootcampDto) {
    return this.bootcampService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bootcamps' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'difficultyLevel', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
  @ApiQuery({ name: 'instructorId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('isPublished') isPublished?: boolean,
    @Query('difficultyLevel') difficultyLevel?: string,
    @Query('instructorId') instructorId?: string,
    @Query('search') search?: string,
  ) {
    return this.bootcampService.findAll({
      isPublished,
      difficultyLevel,
      instructorId,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bootcamp by ID or slug' })
  async findOne(@Param('id') id: string) {
    return this.bootcampService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bootcamp' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: Partial<CreateBootcampDto>) {
    return this.bootcampService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bootcamp' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.bootcampService.delete(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish/unpublish bootcamp' })
  @ApiBearerAuth()
  async togglePublish(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.bootcampService.togglePublish(id, isPublished);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview bootcamp (instructor only)' })
  @ApiBearerAuth()
  async preview(@Param('id') id: string, @Request() req: any) {
    return this.bootcampService.preview(id, req.user.id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get bootcamp statistics (instructor only)' })
  @ApiBearerAuth()
  async getStatistics(@Param('id') id: string, @Request() req: any) {
    return this.bootcampService.getStatistics(id, req.user.id);
  }

  @Post(':id/screening-questions')
  @ApiOperation({ summary: 'Add screening questions' })
  @ApiBearerAuth()
  async addScreeningQuestions(@Param('id') id: string, @Body() body: { questions: any[] }) {
    return this.bootcampService.addScreeningQuestions(id, body.questions);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply to bootcamp' })
  @ApiBearerAuth()
  async apply(@Request() req: any, @Body() dto: ApplyBootcampDto) {
    return this.applicationService.apply(req.user.id, dto);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Get bootcamp applications (instructor only)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getApplications(
    @Param('id') id: string,
    @Request() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.applicationService.getBootcampApplications(id, req.user.id, { status, search });
  }

  @Put('applications/:applicationId/review')
  @ApiOperation({ summary: 'Review application (instructor only)' })
  @ApiBearerAuth()
  async reviewApplication(
    @Param('applicationId') applicationId: string,
    @Request() req: any,
    @Body() body: {
      decision: 'accepted' | 'rejected' | 'waitlisted';
      notes?: string;
      rejectionReason?: string;
    },
  ) {
    return this.applicationService.reviewApplication(
      applicationId,
      req.user.id,
      body.decision,
      body.notes,
      body.rejectionReason,
    );
  }

  @Get('my/applications')
  @ApiOperation({ summary: 'Get my applications' })
  @ApiBearerAuth()
  async getMyApplications(@Request() req: any) {
    return this.applicationService.getUserApplications(req.user.id);
  }
}
