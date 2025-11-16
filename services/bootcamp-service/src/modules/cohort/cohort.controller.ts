import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CohortService } from './cohort.service';
import { AnnouncementService } from './announcement.service';

@ApiTags('Cohorts')
@Controller('cohorts')
export class CohortController {
  constructor(
    private cohortService: CohortService,
    private announcementService: AnnouncementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new cohort' })
  @ApiBearerAuth()
  async create(@Body() data: any) {
    return this.cohortService.create(data);
  }

  @Get('bootcamp/:bootcampId')
  @ApiOperation({ summary: 'Get all cohorts for a bootcamp' })
  async findAllByBootcamp(
    @Param('bootcampId') bootcampId: string,
    @Query('status') status?: string,
  ) {
    return this.cohortService.findAllByBootcamp(bootcampId, { status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cohort details' })
  async findOne(@Param('id') id: string) {
    return this.cohortService.findOne(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get cohort dashboard' })
  @ApiBearerAuth()
  async getDashboard(@Param('id') id: string) {
    return this.cohortService.getDashboard(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cohort' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: any) {
    return this.cohortService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cohort' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.cohortService.delete(id);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Enroll student in cohort' })
  @ApiBearerAuth()
  async enrollStudent(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.cohortService.enrollStudent(id, userId);
  }

  @Get(':id/roster')
  @ApiOperation({ summary: 'Get cohort roster' })
  @ApiBearerAuth()
  async getRoster(@Param('id') id: string) {
    return this.cohortService.getRoster(id);
  }

  @Post(':id/mentors')
  @ApiOperation({ summary: 'Assign mentor to cohort' })
  @ApiBearerAuth()
  async assignMentor(
    @Param('id') id: string,
    @Body('mentorId') mentorId: string,
  ) {
    return this.cohortService.assignMentor(id, mentorId);
  }

  @Delete(':id/mentors/:mentorId')
  @ApiOperation({ summary: 'Remove mentor from cohort' })
  @ApiBearerAuth()
  async removeMentor(
    @Param('id') id: string,
    @Param('mentorId') mentorId: string,
  ) {
    return this.cohortService.removeMentor(id, mentorId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message to cohort chat' })
  @ApiBearerAuth()
  async sendMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { messageText: string; attachments?: any[] },
  ) {
    return this.cohortService.sendMessage(
      id,
      req.user.id,
      body.messageText,
      body.attachments,
    );
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get cohort messages' })
  @ApiBearerAuth()
  async getMessages(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.cohortService.getMessages(id, limit, offset);
  }

  @Post(':id/announcements')
  @ApiOperation({ summary: 'Create cohort announcement' })
  @ApiBearerAuth()
  async createAnnouncement(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.announcementService.create({
      cohortId: id,
      createdBy: req.user.id,
      ...body,
    });
  }

  @Get(':id/announcements')
  @ApiOperation({ summary: 'Get cohort announcements' })
  async getAnnouncements(
    @Param('id') id: string,
    @Query('type') type?: string,
    @Query('pinnedOnly') pinnedOnly?: boolean,
  ) {
    return this.announcementService.findAll(id, { type, pinnedOnly });
  }

  @Put('announcements/:announcementId')
  @ApiOperation({ summary: 'Update announcement' })
  @ApiBearerAuth()
  async updateAnnouncement(
    @Param('announcementId') id: string,
    @Body() data: any,
  ) {
    return this.announcementService.update(id, data);
  }

  @Delete('announcements/:announcementId')
  @ApiOperation({ summary: 'Delete announcement' })
  @ApiBearerAuth()
  async deleteAnnouncement(@Param('announcementId') id: string) {
    return this.announcementService.delete(id);
  }
}
