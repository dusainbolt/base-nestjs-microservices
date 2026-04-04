import { ApiProperty } from '@nestjs/swagger';
import {
  SwaggerBoolean,
  SwaggerDate,
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
  POST_THUMBNAIL = 'POST_THUMBNAIL',
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
  TEMP = 'TEMP',
}


// ─── PAYLOADS ───────────────────────────────────────────────────────────────

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

  @ApiProperty({ enum: ReferType, example: ReferType.USER_AVATAR })
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

  @ApiProperty({ enum: MediaStatus, example: MediaStatus.PENDING })
  status: MediaStatus;

  @ApiProperty({ enum: ReferType, example: ReferType.TEMP, required: false })
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
