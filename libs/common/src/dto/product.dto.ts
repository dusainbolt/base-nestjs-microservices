import {
  SwaggerBoolean,
  SwaggerDate,
  SwaggerEnumArray,
  SwaggerNumber,
  SwaggerString,
} from '../decorators/swagger.decorator';
import { PageOptionsDto } from '../decorators/pagination.decorator';
import { UserBasicInfoDto, UserRelation } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

// ─── PAYLOADS ────────────────────────────────────────────────────────────────

export class CreateProductDto {
  @SwaggerString({ example: 'Product Name' })
  name: string;

  @SwaggerString({ required: false, example: 'Product Description' })
  description?: string;

  @SwaggerNumber({ example: 99.99 })
  price: number;

  @SwaggerNumber({ required: false, example: 100 })
  stock?: number;
}

export class UpdateProductDto {
  @SwaggerString({ required: false, example: 'Updated Product Name' })
  name?: string;

  @SwaggerString({ required: false, example: 'Updated Product Description' })
  description?: string;

  @SwaggerNumber({ required: false, example: 149.99 })
  price?: number;

  @SwaggerNumber({ required: false, example: 50 })
  stock?: number;
}

export class ProductQueryDto extends PageOptionsDto {
  @SwaggerString({
    required: false,
    description: 'Filter by user ID',
    example: 'user-id-123',
  })
  createdByUserId?: string;

  @SwaggerBoolean({ required: false, description: 'Filter by active status' })
  isActive?: boolean;

  @SwaggerEnumArray({
    required: false,
    enum: UserRelation,
    description: 'Relations to include. Supported: createdBy, updatedBy',
    example: [UserRelation.CREATED_BY],
  })
  include?: UserRelation[];
}

export class GetProductByIdDto {
  @SwaggerString({ example: 'prod-123' })
  id: string;
}

export class ProductIncludeQueryDto {
  @SwaggerEnumArray({
    required: false,
    enum: UserRelation,
    description: 'Relations to include. Supported: createdBy, updatedBy',
    example: [UserRelation.CREATED_BY],
  })
  include?: UserRelation[];
}

export class DeleteProductDto {
  @SwaggerString({ example: 'prod-123' })
  id: string;

  @SwaggerString({ description: 'ID of the user making the request' })
  requesterId: string;
}

// ─── RESPONSES ───────────────────────────────────────────────────────────────

export class ProductResponseDto {
  @SwaggerString({ example: 'prod-123' })
  id: string;

  @SwaggerString({ example: 'Product Name' })
  name: string;

  @SwaggerString({ example: 'Product Description' })
  description: string;

  @SwaggerNumber({ example: 99.99 })
  price: number;

  @SwaggerNumber({ example: 100 })
  stock: number;

  @SwaggerBoolean()
  isActive: boolean;

  @SwaggerString({ example: 'user-123' })
  createdByUserId: string;

  @ApiProperty({
    required: false,
    type: () => UserBasicInfoDto,
    description: 'Populated when include=createdBy is requested',
  })
  createdByUser?: UserBasicInfoDto;

  @SwaggerDate()
  createdAt: Date;

  @SwaggerDate()
  updatedAt: Date;
}

export class ProductListDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items: ProductResponseDto[];

  @SwaggerNumber({ description: 'Total number of items' })
  total: number;

  @SwaggerNumber({ description: 'Current page number' })
  page: number;

  @SwaggerNumber({ description: 'Items per page' })
  limit: number;
}
