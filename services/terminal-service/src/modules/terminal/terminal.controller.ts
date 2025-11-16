import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { DockerService } from '../docker/docker.service';

@Controller('terminal')
export class TerminalController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly dockerService: DockerService,
  ) {}

  @Get('sessions')
  async getUserSessions(@Query('userId') userId: string) {
    return await this.sessionService.getUserSessions(userId);
  }

  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return await this.sessionService.getSession(sessionId);
  }

  @Delete('sessions/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    await this.dockerService.stopContainer(sessionId);
    await this.sessionService.deleteSession(sessionId);
    return { message: 'Session deleted successfully' };
  }

  @Get('sessions/:sessionId/stats')
  async getSessionStats(@Param('sessionId') sessionId: string) {
    return await this.dockerService.getContainerStats(sessionId);
  }

  @Get('stats')
  async getStats() {
    const sessionStats = await this.sessionService.getSessionStats();
    const activeContainers = this.dockerService.listActiveContainers();

    return {
      sessions: sessionStats,
      containers: {
        active: activeContainers.length,
      },
    };
  }

  @Post('sessions/:sessionId/extend')
  async extendSession(@Param('sessionId') sessionId: string) {
    await this.sessionService.extendSession(sessionId);
    return { message: 'Session extended successfully' };
  }
}
