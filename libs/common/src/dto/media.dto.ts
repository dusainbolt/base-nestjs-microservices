import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  SwaggerDate,
  SwaggerEnum,
  SwaggerFile,
  SwaggerNumber,
  SwaggerString,
} from '../decorators/swagger.decorator';

// ─── ENUMS ──────────────────────────────────────────────────────────────────

export enum MediaStatus {
  PENDING = 'PENDING',
  USED = 'USED',
  UNUSED = 'UNUSED',
}

export enum ReferType {
  USER_AVATAR = 'USER_AVATAR',
  EXERCISE_AUDIO = 'EXERCISE_AUDIO',
  TEMP = 'TEMP',
}

// ─── PAYLOADS ───────────────────────────────────────────────────────────────

export class MediaUploadDto {
  @SwaggerFile({ description: 'File to upload' })
  file: any;

  @SwaggerEnum({
    enum: ReferType,
    example: ReferType.TEMP,
    default: ReferType.TEMP,
    required: false,
    description: 'Category of the media (for S3 path and organization)',
  })
  type: ReferType;
}

export class MediaBatchUploadDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Files to upload (max 10)',
    required: true,
  })
  files: any[];

  @SwaggerEnum({
    enum: ReferType,
    example: ReferType.TEMP,
    default: ReferType.TEMP,
    required: false,
    description: 'Category of the media (for S3 path and organization)',
  })
  type: ReferType;
}

export class SaveMediaMetadataDto {
  @SwaggerString({ example: 'media/2026/04/abc123.jpg' })
  path: string;

  @SwaggerString({ example: 'my-photo.jpg' })
  originalName: string;

  @SwaggerString({ example: 'image/jpeg' })
  mimeType: string;

  @SwaggerNumber({ example: 204800 })
  size: number;

  @SwaggerString({ example: 'user-123' })
  uploadedByUserId: string;
}

export class MarkMediaUsedDto {
  @SwaggerString({ example: 'media-123' })
  id: string;

  @SwaggerEnum({ enum: ReferType, example: ReferType.USER_AVATAR })
  referType: ReferType;

  @SwaggerString({ example: 'prod-123' })
  referId: string;
}

// ─── RESPONSES ──────────────────────────────────────────────────────────────

export class MediaResponseDto {
  @SwaggerString({ example: 'media-123' })
  id: string;

  @SwaggerString({ example: 'media/2026/04/abc123.jpg' })
  path: string;

  @SwaggerString({ example: 'my-photo.jpg' })
  originalName: string;

  @SwaggerString({ example: 'image/jpeg' })
  mimeType: string;

  @SwaggerNumber({ example: 204800 })
  size: number;

  @SwaggerEnum({ enum: MediaStatus, example: MediaStatus.PENDING })
  status: MediaStatus;

  @SwaggerEnum({ enum: ReferType, example: ReferType.TEMP, required: false })
  referType?: ReferType;

  @SwaggerString({ required: false, example: 'prod-123' })
  referId?: string;

  @SwaggerString({ example: 'user-123' })
  uploadedByUserId: string;

  @SwaggerDate()
  createdAt: Date;

  @SwaggerDate()
  updatedAt: Date;
}
