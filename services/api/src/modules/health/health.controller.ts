import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check health of API Gateway and dependent services' })
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      // Add health checks for microservices when they're available
      // () => this.http.pingCheck('auth-service', 'http://localhost:3001/health'),
      // () => this.http.pingCheck('course-service', 'http://localhost:3002/health'),
    ]);
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'API Gateway',
    };
  }
}
