import {
  ApiHandleResponse,
  ApiPaginatedResponse,
  CurrentUser,
  JwtPayload,
  MEDIA_COMMANDS,
  MEDIA_SERVICE,
  rpcToHttp,
} from '@app/common';
import { MarkMediaUsedDto, MediaResponseDto, ReferType } from '@app/common/dto/media.dto';
import { S3Service, UploadResult } from '@app/common/s3/s3.service';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';

// ─── Size limits per MIME category ────────────────────────────────────────────
const MAX_FILE_SIZE: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 100 * 1024 * 1024, // 100 MB
  audio: 50 * 1024 * 1024, // 50 MB
  application: 20 * 1024 * 1024, // 20 MB (docs, pdf, ...)
  default: 10 * 1024 * 1024, // 10 MB fallback
};

function getMaxSize(mimeType: string): number {
  const category = mimeType.split('/')[0];
  return MAX_FILE_SIZE[category] ?? MAX_FILE_SIZE.default;
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
    private readonly s3: S3Service,
  ) {}

  // ─── Upload Single File ─────────────────────────────────────────────────

  @Post('upload')
  @ApiHandleResponse({
    summary: 'Upload a file to S3 and save metadata',
    type: MediaResponseDto,
    httpStatus: HttpStatus.CREATED,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @Query('type') type: ReferType = ReferType.TEMP,
  ) {

    if (!file) throw new BadRequestException('File is required');
    const maxSize = getMaxSize(file.mimetype);
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)} MB for ${file.mimetype}`,
      );
    }

    // 1. Upload lên S3 với type cụ thể
    const result: UploadResult = await this.s3.upload(file, type);

    // 2. Gửi metadata vào media-service qua RabbitMQ (không cần gửi type nữa vì DB không lưu)
    return this.mediaClient
      .send(
        { cmd: MEDIA_COMMANDS.SAVE_METADATA },
        {
          path: result.path,
          originalName: result.originalName,
          mimeType: result.mimeType,
          size: result.size,
          uploadedByUserId: user.sub,
        },
      )
      .pipe(rpcToHttp());

  }

  // ─── Upload Multiple Files ──────────────────────────────────────────────

  @Post('upload/batch')
  @ApiHandleResponse({
    summary: 'Upload multiple files (max 10)',
    type: [MediaResponseDto],
    httpStatus: HttpStatus.CREATED,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
    @Query('type') type: ReferType = ReferType.TEMP,
  ) {

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Validate size cho từng file
    for (const file of files) {
      const maxSize = getMaxSize(file.mimetype);
      if (file.size > maxSize) {
        throw new BadRequestException(
          `File "${file.originalname}" exceeds limit of ${Math.round(maxSize / 1024 / 1024)} MB`,
        );
      }
    }

    // Upload song song lên S3
    const uploadResults = await Promise.all(
      files.map((file) => this.s3.upload(file, type)),
    );

    // Lưu metadata song song qua RabbitMQ
    const mediaResults = await Promise.all(
      uploadResults.map((result) =>
        lastValueFrom(
          this.mediaClient
            .send(
              { cmd: MEDIA_COMMANDS.SAVE_METADATA },
              {
                path: result.path,
                originalName: result.originalName,
                mimeType: result.mimeType,
                size: result.size,
                uploadedByUserId: user.sub,
              },
            )
            .pipe(rpcToHttp()),
        ),
      ),
    );


    return mediaResults;
  }

  // ─── Get Media By ID ────────────────────────────────────────────────────

  @Get(':id')
  @ApiHandleResponse({ summary: 'Get media by ID', type: MediaResponseDto })
  getById(@Param('id') id: string) {
    return this.mediaClient
      .send({ cmd: MEDIA_COMMANDS.GET_BY_ID }, { id })
      .pipe(rpcToHttp());
  }

  // ─── Get My Media List ──────────────────────────────────────────────────

  @Get()
  @ApiPaginatedResponse(MediaResponseDto, 'Get list of media')
  getList(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
  ) {
    return this.mediaClient
      .send(
        { cmd: MEDIA_COMMANDS.GET_LIST },
        { uploadedByUserId: user.sub, page, take, status },
      )
      .pipe(rpcToHttp());
  }

  // ─── Mark Media as Used ─────────────────────────────────────────────────

  @Patch(':id/use')
  @ApiHandleResponse({
    summary: 'Mark media as used (attach to resource)',
    type: MediaResponseDto,
  })
  markUsed(@Param('id') id: string, @Query() query: MarkMediaUsedDto) {
    return this.mediaClient
      .send({ cmd: MEDIA_COMMANDS.MARK_USED }, { ...query, id })
      .pipe(rpcToHttp());
  }

  // ─── Delete Media ───────────────────────────────────────────────────────

  @Delete(':id')
  @ApiHandleResponse({ summary: 'Delete media', type: Object })
  async deleteMedia(@Param('id') id: string) {
    // Lấy metadata trước để có S3 key
    const media = await lastValueFrom(
      this.mediaClient
        .send({ cmd: MEDIA_COMMANDS.GET_BY_ID }, { id })
        .pipe(rpcToHttp()),
    );

    // Xoá trên S3
    await this.s3.deleteByKey(media.path);

    // Xoá metadata
    return this.mediaClient
      .send({ cmd: MEDIA_COMMANDS.DELETE }, { id })
      .pipe(rpcToHttp());
  }
}
