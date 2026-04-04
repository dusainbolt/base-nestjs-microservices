import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { EnvironmentVariables } from '../interfaces/env.interface';
import { MediaType } from '../dto/media.dto';

export interface UploadResult {
  path: string; // S3 key (không có URL)
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;

  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.bucket = configService.get('AWS_S3_BUCKET_NAME');
    this.region = configService.get('AWS_REGION');
    this.endpoint = configService.get('AWS_ENDPOINT') || undefined;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      // forcePathStyle: true rất quan trọng với các bên S3-compatible (MinIO, BFC, DigitalOcean)
      forcePathStyle: !!this.endpoint,
      // Tắt follow redirect vì Ceph trả về 301 với body không chuẩn S3 XML dễ gây UnknownError
      followRegionRedirects: false,
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_KEY'),
      },
    });

    this.logger.log(
      `S3 initialized → bucket=${this.bucket}, region=${this.region}, endpoint=${this.endpoint ?? 'AWS S3'}`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  URL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Tự động sinh URL dựa trên provider (AWS hoặc S3-compatible)
   * Chuyển từ Path-style sang Virtual-hosted style cho các bên như BFC
   */
  getS3FullUrl = (key: string): string => {
    if (this.endpoint) {
      try {
        const url = new URL(this.endpoint);
        const baseUrl = `${url.protocol}//${this.bucket}.${url.host}`;
        return `${baseUrl}/${key}`;
      } catch (e) {
        const base = this.endpoint.replace(/\/+$/, '');
        return `${base}/${this.bucket}/${key}`;
      }
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Upload file lên S3
   * @param file - Express.Multer.File
   * @param type - Loại file (để quyết định thư mục lưu trữ)
   * @param isPublic - set ACL public-read (default: true)
   * @returns UploadResult chứa path (S3 key)
   */
  async upload(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    type: string | MediaType = MediaType.TEMP,
    isPublic = true,
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const uuid = randomUUID();
    let key: string;

    // Logic đặt tên path theo yêu cầu thực tế
    switch (type) {
      case MediaType.USER_AVATAR:
        key = `user-avatar/${uuid}${ext}`;
        break;
      case MediaType.POST_THUMBNAIL:
        key = `post-thumbnail/${uuid}${ext}`;
        break;
      case MediaType.PRODUCT_IMAGE:
        key = `product-image/${uuid}${ext}`;
        break;
      default:
        // Nếu không thuộc các case trên thì đưa vào temp
        key = `temp/${uuid}${ext}`;
        break;
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: isPublic ? 'public-read' : undefined,
        }),
      );

    } catch (error) {
      this.logger.error(
        `S3 upload failed → bucket=${this.bucket}, key=${key}, endpoint=${this.endpoint ?? 'AWS S3'}`,
      );
      this.logger.error(
        `S3 error details: ${JSON.stringify({
          name: error?.name,
          message: error?.message,
          Code: error?.$metadata?.httpStatusCode,
          requestId: error?.$metadata?.requestId,
        })}`,
      );
      throw error;
    }

    this.logger.log(`Uploaded to S3: ${key} (${file.size} bytes)`);

    return {
      path: key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  READ / EXISTS / DELETE
  // ═══════════════════════════════════════════════════════════════════════════

  async read(key: string): Promise<string> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (res.Body) {
      return res.Body.transformToString();
    }
    return '';
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  async deleteByKey(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`Deleted from S3: ${key}`);
  }

  async deleteByKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const chunks = this.chunk(keys, 1000);
    for (const chunk of chunks) {
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: chunk.map((key) => ({ Key: key })),
            Quiet: true,
          },
        }),
      );
    }
    this.logger.log(`Bulk deleted ${keys.length} files from S3`);
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
