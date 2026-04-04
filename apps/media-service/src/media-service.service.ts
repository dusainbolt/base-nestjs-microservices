import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import {
  MediaResponseDto,
  SaveMediaMetadataDto,
  MarkMediaUsedDto,
  MediaStatus,
} from '@app/common/dto/media.dto';
import { S3Service } from '@app/common/s3/s3.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MediaServiceService {
  private readonly logger = new Logger(MediaServiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  // ─── Query ─────────────────────────────────────────────────────────────────

  async getById(payload: { id: string }): Promise<MediaResponseDto> {
    const media = await this.prisma.media.findUnique({
      where: { id: payload.id },
    });

    if (!media) throw new NotFoundException('Media not found');

    return this.toResponse(media);
  }

  async getList(payload: {
    uploadedByUserId?: string;
    status?: MediaStatus;
  }): Promise<MediaResponseDto[]> {
    const { uploadedByUserId, status } = payload;

    const list = await this.prisma.media.findMany({
      where: {
        uploadedByUserId,
        status: status as any,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((m) => this.toResponse(m));
  }

  async getByPath(payload: { path: string }): Promise<MediaResponseDto> {
    const media = await this.prisma.media.findUnique({
      where: { path: payload.path },
    });

    if (!media) throw new NotFoundException('Media not found by path');

    return this.toResponse(media);
  }

  // ─── Commands ──────────────────────────────────────────────────────────────

  // ═══════════════════════════════════════════════════════════════════════════
  //  SAVE METADATA (sau khi gateway upload xong S3)
  // ═══════════════════════════════════════════════════════════════════════════

  async saveMetadata(payload: SaveMediaMetadataDto): Promise<MediaResponseDto> {
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

    this.logger.log(`Media metadata saved: id=${media.id}, path=${media.path}`);
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
        referType: payload.referType as any,
        referId: payload.referId,
      },
    });

    this.logger.log(
      `Media marked as used: id=${payload.id}, ref=${payload.referType}/${payload.referId}`,
    );
    return this.toResponse(updated);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  DELETE (xóa metadata & file trên S3)
  // ═══════════════════════════════════════════════════════════════════════════

  async delete(payload: { id: string }): Promise<{ success: boolean }> {
    const media = await this.prisma.media.findUnique({
      where: { id: payload.id },
    });

    if (!media) throw new NotFoundException('Media not found');

    // 1. Xóa trong database trước
    await this.prisma.media.delete({ where: { id: payload.id } });

    // 2. Xóa trên S3 sau
    try {
      await this.s3.deleteByKey(media.path);
    } catch (e) {
      this.logger.error(`Failed to delete S3 file: ${media.path}`);
    }

    this.logger.log(`Media deleted: id=${payload.id}, path=${media.path}`);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CLEANUP (Dọn dẹp file rác PENDING quá 24h)
  // ═══════════════════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronCleanup() {
    this.logger.log('Starting automated cleanup of orphan media...');
    await this.cleanupOrphansRpc();
  }

  async cleanupOrphansRpc(): Promise<{ deleted: number }> {
    // Tìm các file PENDING tạo cách đây > 24 giờ
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const orphans = await this.prisma.media.findMany({
      where: {
        status: { in: [MediaStatus.PENDING, MediaStatus.UNUSED] },
        createdAt: { lt: yesterday },
      },
      select: { id: true, path: true },
    });

    if (orphans.length === 0) return { deleted: 0 };

    const ids = orphans.map((o) => o.id);
    const paths = orphans.map((o) => o.path);

    // 1. Xóa trong DB
    await this.prisma.media.deleteMany({
      where: { id: { in: ids } },
    });

    // 2. Xóa hàng loạt trên S3
    try {
      await this.s3.deleteByKeys(paths);
    } catch (e) {
      this.logger.error(`Failed to delete bulk S3 files during cleanup`);
    }

    this.logger.log(`Cleaned up ${orphans.length} orphan media records`);
    return { deleted: orphans.length };
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
      referType: media.referType as any,
      referId: media.referId ?? undefined,
      uploadedByUserId: media.uploadedByUserId,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }
}
