import {
  SwaggerBoolean,
  SwaggerNumber,
  SwaggerString,
} from '../decorators/swagger.decorator';
import { PageOptionsDto } from '../decorators/pagination.decorator';
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
}

export class GetProductByIdDto {
  @SwaggerString({ example: 'prod-123' })
  id: string;
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

  @ApiProperty({ example: '2026-04-03T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-03T00:00:00Z' })
  updatedAt: Date;
}

export class ProductListDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items: ProductResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
