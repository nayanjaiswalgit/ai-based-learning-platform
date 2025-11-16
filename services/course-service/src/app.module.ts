import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { CoursesModule } from './courses/courses.module';
import { VideosModule } from './videos/videos.module';
import { SEOModule } from './seo/seo.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
      max: 100, // Maximum number of items in cache
    }),

    // Feature modules
    DatabaseModule,
    CoursesModule,
    VideosModule,
    SEOModule,
  ],
})
export class AppModule {}
