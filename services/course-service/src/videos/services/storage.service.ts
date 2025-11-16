import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const useR2 = this.configService.get('R2_ACCOUNT_ID');

    if (useR2) {
      // Cloudflare R2 Configuration
      const accountId = this.configService.get('R2_ACCOUNT_ID');
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.configService.get('R2_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
        },
      });
      this.bucket = this.configService.get('R2_BUCKET');
      this.publicUrl = this.configService.get('R2_PUBLIC_URL');
    } else {
      // AWS S3 Configuration
      this.region = this.configService.get('AWS_REGION', 'us-east-1');
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        },
      });
      this.bucket = this.configService.get('AWS_S3_BUCKET');
      this.publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    }

    this.logger.log(`Storage initialized with bucket: ${this.bucket}`);
  }

  /**
   * Upload a file to S3/R2
   */
  async uploadFile(
    file: Buffer,
    folder: string,
    filename?: string,
    contentType?: string,
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${filename || nanoid()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    const url = `${this.publicUrl}/${key}`;

    this.logger.log(`File uploaded: ${key}`);

    return { url, key };
  }

  /**
   * Upload video file
   */
  async uploadVideo(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    return this.uploadFile(file, 'videos', filename, 'video/mp4');
  }

  /**
   * Upload PDF document
   */
  async uploadPDF(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    return this.uploadFile(file, 'documents', filename, 'application/pdf');
  }

  /**
   * Upload and optimize image
   */
  async uploadImage(
    file: Buffer,
    folder: string = 'images',
    options?: { width?: number; height?: number; quality?: number },
  ): Promise<{ url: string; key: string }> {
    // Optimize image with sharp
    let processedImage = sharp(file);

    if (options?.width || options?.height) {
      processedImage = processedImage.resize(options.width, options.height, {
        fit: 'cover',
        position: 'center',
      });
    }

    const optimizedBuffer = await processedImage
      .jpeg({ quality: options?.quality || 80 })
      .toBuffer();

    const filename = `${nanoid()}.jpg`;

    return this.uploadFile(optimizedBuffer, folder, filename, 'image/jpeg');
  }

  /**
   * Upload course thumbnail
   */
  async uploadThumbnail(file: Buffer): Promise<{ url: string; key: string }> {
    return this.uploadImage(file, 'thumbnails', { width: 1280, height: 720, quality: 85 });
  }

  /**
   * Upload code snippet
   */
  async uploadCodeSnippet(code: string, language: string): Promise<{ url: string; key: string }> {
    const filename = `${nanoid()}.${language}`;
    const buffer = Buffer.from(code, 'utf-8');
    return this.uploadFile(buffer, 'code-snippets', filename, 'text/plain');
  }

  /**
   * Generate presigned URL for secure file access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);

    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Upload subtitle/caption file
   */
  async uploadSubtitle(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    return this.uploadFile(file, 'subtitles', filename, 'text/vtt');
  }
}
