import {
  CurrentUser,
  JwtPayload,
  PRODUCT_COMMANDS,
  PRODUCT_SERVICE,
  Public,
  rpcToHttp,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() body: { name: string; description?: string; price: number; stock?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.CREATE }, { ...body, createdByUserId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── Get List ─────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') createdByUserId?: string,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_LIST }, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        ...(createdByUserId && { createdByUserId }),
      })
      .pipe(rpcToHttp());
  }

  // ─── Get By Id ────────────────────────────────────────────────────────────

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getById(@Param('id') id: string) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_BY_ID }, { id })
      .pipe(rpcToHttp());
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; price?: number; stock?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.UPDATE }, { id, ...body, requesterId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.DELETE }, { id, requesterId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── My Products ──────────────────────────────────────────────────────────

  @Get('me/list')
  @HttpCode(HttpStatus.OK)
  getMyProducts(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_LIST }, {
        createdByUserId: user.sub,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      })
      .pipe(rpcToHttp());
  }
}
