import {
  ApiHandleResponse,
  ApiPaginatedResponse,
  CurrentUser,
  JwtPayload,
  MEDIA_COMMANDS,
  MEDIA_SERVICE,
  rpcToHttp,
  validateFileSize,
} from '@app/common';
import {
  MarkMediaUsedDto,
  MediaBatchUploadDto,
  MediaResponseDto,
  MediaUploadDto,
} from '@app/common/dto/media.dto';
import { S3Service, UploadResult } from '@app/common/s3/s3.service';
import {
  BadRequestException,
  Body,
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
  @ApiBody({ type: MediaUploadDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: MediaUploadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('File is required');
    validateFileSize(file);

    // 1. Upload lên S3 với type cụ thể
    const result: UploadResult = await this.s3.upload(file, dto.type);

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
  @ApiBody({ type: MediaBatchUploadDto })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: MediaBatchUploadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Validate size cho từng file
    files.forEach(validateFileSize);

    // Upload song song lên S3
    const uploadResults = await Promise.all(files.map((file) => this.s3.upload(file, dto.type)));

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
    return this.mediaClient.send({ cmd: MEDIA_COMMANDS.GET_BY_ID }, { id }).pipe(rpcToHttp());
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
      .send({ cmd: MEDIA_COMMANDS.GET_LIST }, { uploadedByUserId: user.sub, page, take, status })
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
      this.mediaClient.send({ cmd: MEDIA_COMMANDS.GET_BY_ID }, { id }).pipe(rpcToHttp()),
    );

    // Xoá trên S3
    await this.s3.deleteByKey(media.path);

    // Xoá metadata
    return this.mediaClient.send({ cmd: MEDIA_COMMANDS.DELETE }, { id }).pipe(rpcToHttp());
  }
}
