import {
  ApiHandleResponse,
  ApiPaginatedResponse,
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
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from '@app/common/dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  @Post()
  @ApiHandleResponse({
    summary: 'Create a new product',
    type: ProductResponseDto,
    httpStatus: HttpStatus.CREATED,
  })
  create(
    @Body() body: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.CREATE }, { ...body, createdByUserId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── Get List ─────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiPaginatedResponse(ProductResponseDto, 'Get paginated list of products')
  getList(@Query() query: ProductQueryDto) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_LIST }, {
        page: query.page,
        limit: query.take,
        orderBy: query.orderBy,
        sortBy: query.sortBy,
        ...(query.createdByUserId && { createdByUserId: query.createdByUserId }),
      })
      .pipe(rpcToHttp());
  }

  // ─── Get By Id ────────────────────────────────────────────────────────────

  @Public()
  @Get(':id')
  @ApiHandleResponse({
    summary: 'Get product by ID',
    type: ProductResponseDto,
  })
  getById(@Param('id') id: string) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_BY_ID }, { id })
      .pipe(rpcToHttp());
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiHandleResponse({
    summary: 'Update product listing (Owner only)',
    type: ProductResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.UPDATE }, { id, ...body, requesterId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  @Delete(':id')
  @ApiHandleResponse({
    summary: 'Soft-remove product listing (Owner only)',
    type: Object, // Return result object
  })
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
  @ApiPaginatedResponse(ProductResponseDto, 'Get list of products owned by current user')
  getMyProducts(
    @CurrentUser() user: JwtPayload,
    @Query() query: ProductQueryDto,
  ) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_LIST }, {
        ...query,
        page: query.page,
        limit: query.take,
        createdByUserId: user.sub,
      })
      .pipe(rpcToHttp());
  }
}
