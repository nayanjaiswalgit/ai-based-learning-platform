import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from './storage.service';
import { MuxService } from './mux.service';

@Injectable()
export class VideoUploadService {
  private readonly logger = new Logger(VideoUploadService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private muxService: MuxService,
  ) {}

  /**
   * Upload video and create Mux asset
   */
  async uploadAndTranscodeVideo(
    file: Buffer,
    lessonId: string,
    filename: string,
    enableDRM: boolean = false,
  ) {
    this.logger.log(`Uploading video for lesson: ${lessonId}`);

    // Step 1: Upload to S3/R2
    const { url: videoUrl, key } = await this.storageService.uploadVideo(file, filename);

    this.logger.log(`Video uploaded to storage: ${key}`);

    // Step 2: Send to Mux for transcoding
    const playbackPolicy = enableDRM ? 'signed' : 'public';
    const muxAsset = await this.muxService.uploadVideo(videoUrl, {
      passthrough: lessonId,
      playbackPolicy,
    });

    this.logger.log(`Mux asset created: ${muxAsset.assetId}`);

    // Step 3: Update lesson with Mux details
    const updatedLesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        contentUrl: videoUrl,
        muxAssetId: muxAsset.assetId,
        muxPlaybackId: muxAsset.playbackId,
      },
    });

    return {
      lessonId,
      storageUrl: videoUrl,
      storageKey: key,
      muxAssetId: muxAsset.assetId,
      muxPlaybackId: muxAsset.playbackId,
      status: muxAsset.status,
    };
  }

  /**
   * Create direct upload URL for client-side uploads
   */
  async createDirectUploadUrl(lessonId: string, corsOrigin?: string) {
    const upload = await this.muxService.createDirectUpload({
      corsOrigin,
      passthrough: lessonId,
    });

    return upload;
  }

  /**
   * Get playback URL for a lesson
   */
  async getPlaybackUrl(lessonId: string, userId: string, enableDRM: boolean = false) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson || !lesson.muxPlaybackId) {
      throw new Error('Lesson video not found');
    }

    // Check if DRM is enabled or if it's a premium course
    const useDRM = enableDRM || !lesson.module.course.isFree;

    if (useDRM) {
      // Generate signed URL with watermarking data
      const signedUrl = this.muxService.generateSignedPlaybackUrl(lesson.muxPlaybackId, {
        expiresIn: 7200, // 2 hours
      });

      return {
        playbackUrl: signedUrl,
        playbackId: lesson.muxPlaybackId,
        type: 'signed',
        watermark: {
          userId,
          lessonId,
        },
      };
    }

    // Return public playback URL
    return {
      playbackUrl: `https://stream.mux.com/${lesson.muxPlaybackId}.m3u8`,
      playbackId: lesson.muxPlaybackId,
      type: 'public',
    };
  }

  /**
   * Upload PDF document
   */
  async uploadPDF(file: Buffer, filename: string, lessonId: string) {
    const { url, key } = await this.storageService.uploadPDF(file, filename);

    await this.prisma.lessonResource.create({
      data: {
        lessonId,
        resourceType: 'pdf',
        resourceUrl: url,
        title: filename,
        fileSizeBytes: BigInt(file.length),
      },
    });

    return { url, key };
  }

  /**
   * Upload subtitle file
   */
  async uploadSubtitle(
    file: Buffer,
    filename: string,
    lessonId: string,
    languageCode: string,
    languageName: string,
  ) {
    // Upload subtitle file to storage
    const { url, key } = await this.storageService.uploadSubtitle(file, filename);

    // Add subtitle track to Mux asset
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (lesson?.muxAssetId) {
      await this.muxService.addSubtitles(
        lesson.muxAssetId,
        url,
        languageCode,
        languageName,
      );
    }

    return { url, key };
  }

  /**
   * Get video thumbnail
   */
  getThumbnailUrl(playbackId: string, time?: number) {
    return this.muxService.generateThumbnailUrl(playbackId, {
      time,
      width: 1280,
      height: 720,
    });
  }
}
