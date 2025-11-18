import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ExecutionModule } from './modules/execution/execution.module';
import { TestCaseModule } from './modules/test-case/test-case.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // BullMQ for execution queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    // Redis cache for execution results
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: 3600, // 1 hour cache
    }),
    ExecutionModule,
    TestCaseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
