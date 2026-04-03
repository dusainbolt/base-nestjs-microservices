import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  DEFAULT_PAGE,
  DEFAULT_TAKE,
  MAX_TAKE,
  SortOrder,
} from '../constants/pagination.constants';
import { SwaggerEnum, SwaggerNumber, SwaggerString } from './swagger.decorator';

export class PageOptionsDto {
  @SwaggerString({
    required: false,
    default: 'createdAt',
    description: 'Field to order results by (e.g., createdAt, updatedAt)',
  })
  readonly orderBy?: string = 'createdAt';

  @SwaggerEnum({
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
    description: 'Sort order direction (asc or desc)',
  })
  readonly sortBy?: SortOrder = SortOrder.DESC;

  @SwaggerNumber({
    required: false,
    minimum: 1,
    default: DEFAULT_PAGE,
    description: 'Page number',
  })
  readonly page: number = DEFAULT_PAGE;

  @SwaggerNumber({
    required: false,
    minimum: 1,
    maximum: MAX_TAKE,
    default: DEFAULT_TAKE,
    description: 'Number of items per page',
  })
  readonly take: number = DEFAULT_TAKE;

  get skip(): number {
    const page = Math.max(1, this.page || DEFAULT_PAGE);
    const take = this.take || DEFAULT_TAKE;
    return (page - 1) * take;
  }
}

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @ApiProperty({ description: 'Number of items per page' })
  readonly take: number;

  @ApiProperty({ description: 'Total number of items in the result set' })
  readonly itemCount: number;

  @ApiProperty({ description: 'Total number of pages available' })
  readonly pageCount: number;

  @ApiProperty({ description: 'Whether there is a previous page' })
  readonly hasPreviousPage: boolean;

  @ApiProperty({ description: 'Whether there is a next page' })
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = Number(pageOptionsDto.page);
    this.take = Number(pageOptionsDto.take);
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class PageDto<T> {
  @IsArray()
  @ApiProperty({
    isArray: true,
    description: 'Array of data items for the current page',
  })
  readonly data: T[];

  @ApiProperty({
    type: () => PageMetaDto,
    description: 'Pagination metadata for the current page',
  })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
