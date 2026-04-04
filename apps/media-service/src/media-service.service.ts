import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  SaveMediaMetadataDto,
  MarkMediaUsedDto,
  MediaResponseDto,
  MediaStatus,
} from '@app/common/dto/media.dto';
import { PrismaService } from './prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MediaServiceService {
  private readonly logger = new Logger(MediaServiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  SAVE METADATA (sau khi gateway upload xong S3)
  // ═══════════════════════════════════════════════════════════════════════════

  async saveMetadata(
    payload: SaveMediaMetadataDto,
  ): Promise<MediaResponseDto> {
    const media = await this.prisma.media.create({
      data: {
        path: payload.path,
        originalName: payload.originalName,
        mimeType: payload.mimeType,
        size: payload.size,
        uploadedByUserId: payload.uploadedByUserId,
        status: MediaStatus.PENDING,
      },
    });

    this.logger.log(
      `Media metadata saved: id=${media.id}, path=${media.path}`,
    );
    return this.toResponse(media);
  }

  // ... (getById, getByPath, getList giữ nguyên)

  // ═══════════════════════════════════════════════════════════════════════════
  //  MARK USED (gắn file vào resource)
  // ═══════════════════════════════════════════════════════════════════════════

  async markUsed(payload: MarkMediaUsedDto): Promise<MediaResponseDto> {
    const media = await this.prisma.media.findUnique({
      where: { id: payload.id },
    });

    if (!media) throw new NotFoundException('Media not found');

    const updated = await this.prisma.media.update({
      where: { id: payload.id },
      data: {
        status: MediaStatus.USED,
        referPath: payload.referPath,
      },
    });

    this.logger.log(
      `Media marked as used: id=${payload.id}, referPath=${payload.referPath}`,
    );
    return this.toResponse(updated);
  }

  // ... (delete, cleanupOrphans giữ nguyên)

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAPPER
  // ═══════════════════════════════════════════════════════════════════════════

  private toResponse(media: any): MediaResponseDto {
    return {
      id: media.id,
      path: media.path,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      status: media.status as MediaStatus,
      referPath: media.referPath ?? undefined,
      uploadedByUserId: media.uploadedByUserId,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }


}
