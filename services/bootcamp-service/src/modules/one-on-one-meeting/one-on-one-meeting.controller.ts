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
import { OneOnOneMeetingService } from './one-on-one-meeting.service';

@ApiTags('1:1 Meetings')
@Controller('one-on-one-meetings')
export class OneOnOneMeetingController {
  constructor(private meetingService: OneOnOneMeetingService) {}

  @Post('availability')
  @ApiOperation({ summary: 'Set mentor availability' })
  @ApiBearerAuth()
  async setAvailability(@Request() req: any, @Body() body: { slots: any[] }) {
    return this.meetingService.setAvailability(req.user.id, body.slots);
  }

  @Get('availability/:mentorId')
  @ApiOperation({ summary: 'Get mentor availability' })
  async getAvailability(@Param('mentorId') mentorId: string) {
    return this.meetingService.getAvailability(mentorId);
  }

  @Post('book')
  @ApiOperation({ summary: 'Book 1:1 meeting' })
  @ApiBearerAuth()
  async bookMeeting(@Request() req: any, @Body() data: any) {
    return this.meetingService.bookMeeting({
      ...data,
      studentId: req.user.id,
    });
  }

  @Get('my-meetings')
  @ApiOperation({ summary: 'Get my meetings' })
  @ApiBearerAuth()
  async getMyMeetings(
    @Request() req: any,
    @Query('role') role: 'mentor' | 'student',
    @Query('status') status?: string,
    @Query('upcoming') upcoming?: boolean,
  ) {
    return this.meetingService.getUserMeetings(req.user.id, role, { status, upcoming });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meeting details' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.meetingService.findOne(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel meeting' })
  @ApiBearerAuth()
  async cancel(@Param('id') id: string, @Request() req: any) {
    return this.meetingService.cancel(id, req.user.id);
  }

  @Put(':id/notes')
  @ApiOperation({ summary: 'Add meeting notes' })
  @ApiBearerAuth()
  async addNotes(
    @Param('id') id: string,
    @Request() req: any,
    @Body('notes') notes: string,
  ) {
    return this.meetingService.addNotes(id, req.user.id, notes);
  }

  @Post(':id/action-items')
  @ApiOperation({ summary: 'Add action item' })
  @ApiBearerAuth()
  async addActionItem(@Param('id') id: string, @Body() data: any) {
    return this.meetingService.addActionItem(id, data);
  }

  @Put('action-items/:actionItemId/complete')
  @ApiOperation({ summary: 'Complete action item' })
  @ApiBearerAuth()
  async completeActionItem(@Param('actionItemId') id: string) {
    return this.meetingService.completeActionItem(id);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark meeting as completed' })
  @ApiBearerAuth()
  async markCompleted(
    @Param('id') id: string,
    @Body('recordingUrl') recordingUrl?: string,
  ) {
    return this.meetingService.markCompleted(id, recordingUrl);
  }
}
