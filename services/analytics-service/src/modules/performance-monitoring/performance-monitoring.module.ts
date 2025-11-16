import { Module } from '@nestjs/common'
import { PerformanceMonitoringController } from './performance-monitoring.controller'
import { PerformanceMonitoringService } from './performance-monitoring.service'

@Module({
  controllers: [PerformanceMonitoringController],
  providers: [PerformanceMonitoringService],
  exports: [PerformanceMonitoringService],
})
export class PerformanceMonitoringModule {}
