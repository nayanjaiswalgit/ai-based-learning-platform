import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis-yet';
import aiConfig from './config/ai.config';
import databaseConfig from './config/database.config';

// Import all feature modules
import { SkillAssessmentModule } from './modules/skill-assessment/skill-assessment.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { VectorSearchModule } from './modules/vector-search/vector-search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [aiConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Cache module with Redis
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore as any,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
      }),
    }),

    // Feature modules
    SkillAssessmentModule,
    RoadmapModule,
    RecommendationsModule,
    ChatbotModule,
    VectorSearchModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
