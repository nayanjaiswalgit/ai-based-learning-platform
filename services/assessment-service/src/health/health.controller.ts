import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'assessment-service',
        version: '1.0.0',
        checks: {
          database: 'connected',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'assessment-service',
        version: '1.0.0',
        checks: {
          database: 'disconnected',
        },
        error: error.message,
      };
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  async readinessCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
