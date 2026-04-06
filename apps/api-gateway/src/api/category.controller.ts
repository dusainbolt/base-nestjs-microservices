import {
  ApiHandleResponse,
  CONTENT_COMMANDS,
  CONTENT_SERVICE,
  Public,
  rpcToHttp,
} from '@app/common';
import {
  CategoryContentSummaryListDto,
  CategoryListDto,
  CategoryResponseDto,
  CategoryType,
  GetCategoriesDto,
} from '@app/common/dto/content.dto';
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    @Inject(CONTENT_SERVICE) private readonly contentClient: ClientProxy,
  ) {}

  // ─── Get List ─────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiHandleResponse({
    summary: 'Get list of categories (optional filter by type)',
    type: CategoryListDto,
  })
  getCategories(@Query() query: GetCategoriesDto) {
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.GET_CATEGORIES }, query)
      .pipe(rpcToHttp());
  }

  // ─── Get By Id ────────────────────────────────────────────────────────────

  @Public()
  @Get('content-summary')
  @ApiHandleResponse({
    summary:
      'Get content summary for all category types (dashboard denominator)',
    type: CategoryContentSummaryListDto,
  })
  getContentSummary() {
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.GET_CATEGORIES_CONTENT_SUMMARY }, {})
      .pipe(rpcToHttp());
  }

  // ─── Get Exercise Count By Category Type ──────────────────────────────────

  @Public()
  @Get('exercises-count/:type')
  @ApiHandleResponse({
    summary: 'Get total exercises count for a specific category type',
    type: Object,
  })
  getExerciseCount(@Param('type') type: string) {
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.GET_TOTAL_EXERCISES_PER_CATEGORY },
        { type },
      )
      .pipe(rpcToHttp());
  }

  // ─── Get Category By Id ───────────────────────────────────────────────────

  @Public()
  @Get(':id')
  @ApiHandleResponse({
    summary: 'Get category by ID',
    type: CategoryResponseDto,
  })
  getById(@Param('id') id: string) {
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.GET_CATEGORY_BY_ID }, { id })
      .pipe(rpcToHttp());
  }
}
