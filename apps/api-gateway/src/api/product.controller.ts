import {
  ApiHandleResponse,
  ApiPaginatedResponse,
  CurrentUser,
  JwtPayload,
  PRODUCT_COMMANDS,
  PRODUCT_SERVICE,
  Public,
  resolveUserFields,
  rpcToHttp,
  UserEnrichService,
} from '@app/common';
import {
  CreateProductDto,
  ProductIncludeQueryDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from '@app/common/dto/product.dto';
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

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
    private readonly userEnrich: UserEnrichService,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  @Post()
  @ApiHandleResponse({
    summary: 'Create a new product',
    type: ProductResponseDto,
    httpStatus: HttpStatus.CREATED,
  })
  create(@Body() body: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productClient
      .send(
        { cmd: PRODUCT_COMMANDS.CREATE },
        { ...body, createdByUserId: user.sub },
      )
      .pipe(rpcToHttp());
  }

  // ─── Get List ─────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiPaginatedResponse(ProductResponseDto, 'Get paginated list of products')
  getList(@Query() query: ProductQueryDto) {
    const { include, ...productQuery } = query;
    const fields = resolveUserFields(include ?? []);

    const products$ = this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_LIST }, productQuery)
      .pipe(rpcToHttp());

    return fields.length
      ? products$.pipe(this.userEnrich.list(fields))
      : products$;
  }

  // ─── Get By Id ────────────────────────────────────────────────────────────

  @Public()
  @Get(':id')
  @ApiHandleResponse({ summary: 'Get product by ID', type: ProductResponseDto })
  getById(@Param('id') id: string, @Query() query: ProductIncludeQueryDto) {
    const fields = resolveUserFields(query.include ?? []);

    const product$ = this.productClient
      .send({ cmd: PRODUCT_COMMANDS.GET_BY_ID }, { id })
      .pipe(rpcToHttp());

    return fields.length
      ? product$.pipe(this.userEnrich.single(fields))
      : product$;
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
      .send(
        { cmd: PRODUCT_COMMANDS.UPDATE },
        { id, ...body, requesterId: user.sub },
      )
      .pipe(rpcToHttp());
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  @Delete(':id')
  @ApiHandleResponse({
    summary: 'Soft-remove product listing (Owner only)',
    type: Object,
  })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productClient
      .send({ cmd: PRODUCT_COMMANDS.DELETE }, { id, requesterId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── My Products ──────────────────────────────────────────────────────────

  @Get('me/list')
  @ApiPaginatedResponse(
    ProductResponseDto,
    'Get list of products owned by current user',
  )
  getMyProducts(
    @CurrentUser() user: JwtPayload,
    @Query() query: ProductQueryDto,
  ) {
    const { include, ...productQuery } = query;
    const fields = resolveUserFields(include ?? []);

    const products$ = this.productClient
      .send(
        { cmd: PRODUCT_COMMANDS.GET_LIST },
        { ...productQuery, createdByUserId: user.sub },
      )
      .pipe(rpcToHttp());

    return fields.length
      ? products$.pipe(this.userEnrich.list(fields))
      : products$;
  }
}
