import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { CacheModule } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-ioredis-yet'
import { UserAnalyticsModule } from './modules/user-analytics/user-analytics.module'
import { InstructorAnalyticsModule } from './modules/instructor-analytics/instructor-analytics.module'
import { AdminAnalyticsModule } from './modules/admin-analytics/admin-analytics.module'
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module'
import { PerformanceMonitoringModule } from './modules/performance-monitoring/performance-monitoring.module'
import { ReportingModule } from './modules/reporting/reporting.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          ttl: 3600, // 1 hour default
        }),
      }),
    }),
    UserAnalyticsModule,
    InstructorAnalyticsModule,
    AdminAnalyticsModule,
    FeatureFlagsModule,
    PerformanceMonitoringModule,
    ReportingModule,
  ],
})
export class AppModule {}
