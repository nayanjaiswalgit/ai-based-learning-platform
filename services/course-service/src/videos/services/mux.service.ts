import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mux from '@mux/mux-node';

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  private muxClient: any;
  private signingKeyId: string;
  private signingKeyPrivate: string;

  constructor(private configService: ConfigService) {
    const tokenId = this.configService.get('MUX_TOKEN_ID');
    const tokenSecret = this.configService.get('MUX_TOKEN_SECRET');

    if (!tokenId || !tokenSecret) {
      this.logger.warn('Mux credentials not configured');
      return;
    }

    this.muxClient = new Mux({
      tokenId,
      tokenSecret,
    });

    this.signingKeyId = this.configService.get('MUX_SIGNING_KEY_ID');
    this.signingKeyPrivate = this.configService.get('MUX_SIGNING_KEY_PRIVATE_KEY');

    this.logger.log('Mux service initialized');
  }

  /**
   * Upload a video to Mux for transcoding
   */
  async uploadVideo(videoUrl: string, options?: {
    passthrough?: string;
    playbackPolicy?: 'public' | 'signed';
    mp4Support?: 'standard' | 'none';
    test?: boolean;
  }) {
    try {
      const asset = await this.muxClient.video.assets.create({
        input: [{ url: videoUrl }],
        playback_policy: [options?.playbackPolicy || 'public'],
        mp4_support: options?.mp4Support || 'standard',
        passthrough: options?.passthrough || '',
        test: options?.test || false,
      });

      this.logger.log(`Mux asset created: ${asset.id}`);

      return {
        assetId: asset.id,
        playbackId: asset.playback_ids[0]?.id,
        status: asset.status,
      };
    } catch (error) {
      this.logger.error('Failed to upload video to Mux', error);
      throw new BadRequestException('Failed to upload video to Mux');
    }
  }

  /**
   * Create a direct upload URL for client-side uploads
   */
  async createDirectUpload(options?: {
    corsOrigin?: string;
    passthrough?: string;
    test?: boolean;
  }) {
    try {
      const upload = await this.muxClient.video.uploads.create({
        cors_origin: options?.corsOrigin || '*',
        new_asset_settings: {
          playback_policy: ['signed'], // Use signed URLs for security
          mp4_support: 'standard',
          passthrough: options?.passthrough || '',
          test: options?.test || false,
        },
      });

      this.logger.log(`Direct upload created: ${upload.id}`);

      return {
        uploadId: upload.id,
        url: upload.url,
        status: upload.status,
      };
    } catch (error) {
      this.logger.error('Failed to create direct upload', error);
      throw new BadRequestException('Failed to create direct upload');
    }
  }

  /**
   * Get asset details
   */
  async getAsset(assetId: string) {
    try {
      const asset = await this.muxClient.video.assets.retrieve(assetId);
      return {
        id: asset.id,
        status: asset.status,
        playbackIds: asset.playback_ids,
        duration: asset.duration,
        aspectRatio: asset.aspect_ratio,
        createdAt: asset.created_at,
      };
    } catch (error) {
      this.logger.error(`Failed to get asset: ${assetId}`, error);
      throw new BadRequestException('Failed to get asset details');
    }
  }

  /**
   * Generate a signed playback URL for DRM protection
   */
  generateSignedPlaybackUrl(playbackId: string, options?: {
    expiresIn?: number;
    type?: 'video' | 'thumbnail' | 'gif';
  }): string {
    if (!this.signingKeyId || !this.signingKeyPrivate) {
      this.logger.warn('Mux signing keys not configured, returning unsigned URL');
      return `https://stream.mux.com/${playbackId}.m3u8`;
    }

    try {
      const type = options?.type || 'video';
      const expiresIn = options?.expiresIn || 7200; // 2 hours default
      const baseUrl = `https://stream.mux.com/${playbackId}`;

      // Create signed URL with expiration
      const expiration = Math.floor(Date.now() / 1000) + expiresIn;
      const token = Mux.JWT.signPlaybackId(playbackId, {
        keyId: this.signingKeyId,
        keySecret: this.signingKeyPrivate,
        expiration,
        type,
      });

      return `${baseUrl}.m3u8?token=${token}`;
    } catch (error) {
      this.logger.error('Failed to generate signed URL', error);
      return `https://stream.mux.com/${playbackId}.m3u8`;
    }
  }

  /**
   * Add subtitles/captions to a video
   */
  async addSubtitles(assetId: string, subtitleUrl: string, languageCode: string, name: string) {
    try {
      const track = await this.muxClient.video.assets.createTrack(assetId, {
        type: 'text',
        text_type: 'subtitles',
        language_code: languageCode,
        name,
        url: subtitleUrl,
      });

      this.logger.log(`Subtitles added to asset ${assetId}`);

      return track;
    } catch (error) {
      this.logger.error('Failed to add subtitles', error);
      throw new BadRequestException('Failed to add subtitles');
    }
  }

  /**
   * Delete a Mux asset
   */
  async deleteAsset(assetId: string) {
    try {
      await this.muxClient.video.assets.delete(assetId);
      this.logger.log(`Asset deleted: ${assetId}`);
    } catch (error) {
      this.logger.error(`Failed to delete asset: ${assetId}`, error);
      throw new BadRequestException('Failed to delete asset');
    }
  }

  /**
   * Generate thumbnail URL
   */
  generateThumbnailUrl(playbackId: string, options?: {
    time?: number;
    width?: number;
    height?: number;
  }): string {
    const params = new URLSearchParams();

    if (options?.time !== undefined) {
      params.append('time', options.time.toString());
    }
    if (options?.width) {
      params.append('width', options.width.toString());
    }
    if (options?.height) {
      params.append('height', options.height.toString());
    }

    const queryString = params.toString();
    const baseUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Get video analytics data
   */
  async getVideoViews(assetId: string) {
    try {
      // This would require Mux Data API integration
      // For now, return placeholder
      return {
        assetId,
        views: 0,
        playTime: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get video analytics', error);
      return { assetId, views: 0, playTime: 0 };
    }
  }

  /**
   * Enable DRM for an asset
   */
  async enableDRM(assetId: string) {
    try {
      const asset = await this.muxClient.video.assets.update(assetId, {
        playback_policy: ['signed'], // Change to signed playback
      });

      this.logger.log(`DRM enabled for asset: ${assetId}`);

      return {
        assetId: asset.id,
        playbackPolicy: asset.playback_policy,
      };
    } catch (error) {
      this.logger.error('Failed to enable DRM', error);
      throw new BadRequestException('Failed to enable DRM');
    }
  }
}
