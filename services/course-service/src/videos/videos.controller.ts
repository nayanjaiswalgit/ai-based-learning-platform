import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoUploadService } from './services/video-upload.service';
import { VideoAnalyticsService } from './services/video-analytics.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(
    private readonly videoUploadService: VideoUploadService,
    private readonly analyticsService: VideoAnalyticsService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload and transcode video' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('lessonId') lessonId: string,
    @Body('enableDRM') enableDRM?: string,
  ) {
    return this.videoUploadService.uploadAndTranscodeVideo(
      file.buffer,
      lessonId,
      file.originalname,
      enableDRM === 'true',
    );
  }

  @Post('direct-upload')
  @ApiOperation({ summary: 'Create direct upload URL for client-side upload' })
  createDirectUpload(@Body() data: { lessonId: string; corsOrigin?: string }) {
    return this.videoUploadService.createDirectUploadUrl(data.lessonId, data.corsOrigin);
  }

  @Get('playback/:lessonId')
  @ApiOperation({ summary: 'Get playback URL for a lesson' })
  getPlaybackUrl(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Query('enableDRM') enableDRM?: string,
  ) {
    return this.videoUploadService.getPlaybackUrl(lessonId, userId, enableDRM === 'true');
  }

  @Post('pdf-upload')
  @ApiOperation({ summary: 'Upload PDF document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Body('lessonId') lessonId: string,
  ) {
    return this.videoUploadService.uploadPDF(file.buffer, file.originalname, lessonId);
  }

  @Post('subtitle-upload')
  @ApiOperation({ summary: 'Upload subtitle file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadSubtitle(
    @UploadedFile() file: Express.Multer.File,
    @Body('lessonId') lessonId: string,
    @Body('languageCode') languageCode: string,
    @Body('languageName') languageName: string,
  ) {
    return this.videoUploadService.uploadSubtitle(
      file.buffer,
      file.originalname,
      lessonId,
      languageCode,
      languageName,
    );
  }

  @Post('analytics/view')
  @ApiOperation({ summary: 'Track video view' })
  trackView(@Body() data: { lessonId: string; userId: string; watchTimeSeconds: number }) {
    return this.analyticsService.trackView(data.lessonId, data.userId, data.watchTimeSeconds);
  }

  @Post('analytics/drop-off')
  @ApiOperation({ summary: 'Track drop-off point' })
  trackDropOff(@Body() data: { lessonId: string; timestampPercentage: number }) {
    return this.analyticsService.trackDropOff(data.lessonId, data.timestampPercentage);
  }

  @Get('analytics/lesson/:lessonId')
  @ApiOperation({ summary: 'Get lesson analytics' })
  getLessonAnalytics(@Param('lessonId') lessonId: string) {
    return this.analyticsService.getLessonAnalytics(lessonId);
  }

  @Get('analytics/course/:courseId')
  @ApiOperation({ summary: 'Get course video analytics' })
  getCourseAnalytics(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseVideoAnalytics(courseId);
  }
}
