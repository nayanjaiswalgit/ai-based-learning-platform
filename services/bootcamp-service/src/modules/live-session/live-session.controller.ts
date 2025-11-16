import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LiveSessionService } from './live-session.service';

@ApiTags('Live Sessions')
@Controller('live-sessions')
export class LiveSessionController {
  constructor(private liveSessionService: LiveSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a live session' })
  @ApiBearerAuth()
  async scheduleSession(@Body() data: any) {
    return this.liveSessionService.scheduleSession(data);
  }

  @Get('cohort/:cohortId')
  @ApiOperation({ summary: 'Get all sessions for a cohort' })
  async findAllByCohort(
    @Param('cohortId') cohortId: string,
    @Query('upcoming') upcoming?: boolean,
    @Query('past') past?: boolean,
  ) {
    return this.liveSessionService.findAllByCohort(cohortId, { upcoming, past });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  async findOne(@Param('id') id: string) {
    return this.liveSessionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update session' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: any) {
    return this.liveSessionService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete session' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.liveSessionService.delete(id);
  }

  @Post(':id/attendance')
  @ApiOperation({ summary: 'Record attendance' })
  @ApiBearerAuth()
  async recordAttendance(
    @Param('id') id: string,
    @Body() body: { userId: string; attended: boolean },
  ) {
    return this.liveSessionService.recordAttendance(id, body.userId, body.attended);
  }

  @Get(':id/attendance-report')
  @ApiOperation({ summary: 'Get attendance report' })
  @ApiBearerAuth()
  async getAttendanceReport(@Param('id') id: string) {
    return this.liveSessionService.getAttendanceReport(id);
  }

  @Put(':id/recording')
  @ApiOperation({ summary: 'Upload session recording' })
  @ApiBearerAuth()
  async uploadRecording(
    @Param('id') id: string,
    @Body('recordingUrl') recordingUrl: string,
  ) {
    return this.liveSessionService.uploadRecording(id, recordingUrl);
  }

  @Get(':id/recording')
  @ApiOperation({ summary: 'Get session recording' })
  async getRecording(@Param('id') id: string) {
    return this.liveSessionService.getRecording(id);
  }
}
