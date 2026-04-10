import { MEDIA_COMMANDS, RmqInterceptor } from '@app/common';
import { SaveMediaMetadataDto, MarkMediaUsedDto } from '@app/common/dto/media.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MediaServiceService } from './media-service.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class MediaServiceController {
  constructor(
    private readonly mediaService: MediaServiceService,
    private readonly prisma: PrismaService,
  ) {}

  @MessagePattern({ cmd: MEDIA_COMMANDS.PING })
  async ping() {
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'down';
    }
    return { db: dbStatus };
  }

  // ─── Metadata CRUD ──────────────────────────────────────────────────────

  @MessagePattern({ cmd: MEDIA_COMMANDS.SAVE_METADATA })
  saveMetadata(@Payload() data: SaveMediaMetadataDto) {
    return this.mediaService.saveMetadata(data);
  }

  @MessagePattern({ cmd: MEDIA_COMMANDS.GET_BY_ID })
  getById(@Payload() data: { id: string }) {
    return this.mediaService.getById(data);
  }

  @MessagePattern({ cmd: MEDIA_COMMANDS.GET_BY_PATH })
  getByPath(@Payload() data: { path: string }) {
    return this.mediaService.getByPath(data);
  }

  @MessagePattern({ cmd: MEDIA_COMMANDS.GET_LIST })
  getList(@Payload() data: any) {
    return this.mediaService.getList(data);
  }

  @MessagePattern({ cmd: MEDIA_COMMANDS.MARK_USED })
  markUsed(@Payload() data: MarkMediaUsedDto) {
    return this.mediaService.markUsed(data);
  }

  @MessagePattern({ cmd: MEDIA_COMMANDS.DELETE })
  delete(@Payload() data: { id: string }) {
    return this.mediaService.delete(data);
  }

  // ─── Manual cleanup trigger ─────────────────────────────────────────────

  @MessagePattern({ cmd: MEDIA_COMMANDS.CLEANUP_ORPHANS })
  cleanupOrphans() {
    return this.mediaService.cleanupOrphansRpc();
  }
}
