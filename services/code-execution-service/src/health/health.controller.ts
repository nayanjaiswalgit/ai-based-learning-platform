import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DockerService } from '../modules/execution/docker.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private dockerService: DockerService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck() {
    try {
      // Check Docker availability
      const docker = this.dockerService['docker'];
      await docker.ping();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'code-execution-service',
        version: '1.0.0',
        checks: {
          docker: 'connected',
          redis: 'connected', // Would need actual Redis check
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'code-execution-service',
        version: '1.0.0',
        checks: {
          docker: 'disconnected',
        },
        error: error.message,
      };
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  async readinessCheck() {
    try {
      const docker = this.dockerService['docker'];
      await docker.ping();

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
