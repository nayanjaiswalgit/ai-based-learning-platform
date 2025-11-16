import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideosController } from './videos.controller';
import { VideoUploadService } from './services/video-upload.service';
import { MuxService } from './services/mux.service';
import { StorageService } from './services/storage.service';
import { VideoAnalyticsService } from './services/video-analytics.service';

@Module({
  imports: [ConfigModule],
  controllers: [VideosController],
  providers: [
    VideoUploadService,
    MuxService,
    StorageService,
    VideoAnalyticsService,
  ],
  exports: [VideoUploadService, MuxService, StorageService],
})
export class VideosModule {}
