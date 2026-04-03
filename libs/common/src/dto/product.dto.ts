import {
  SwaggerNumber,
  SwaggerString,
} from '../decorators/swagger.decorator';
import { PageOptionsDto } from '../decorators/pagination.decorator';
import { IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @SwaggerString({ required: true, example: 'Product Name' })
  name: string;

  @SwaggerString({ required: false, example: 'Product Description' })
  description?: string;

  @SwaggerNumber({ required: true, example: 99.99 })
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
  @IsOptional()
  @IsString()
  @SwaggerString({
    required: false,
    description: 'Filter by user ID',
    example: 'user-id-123',
  })
  createdByUserId?: string;
}

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

  @SwaggerString({ example: 'user-123' })
  createdByUserId: string;

  @SwaggerString({ example: '2026-04-03T00:00:00Z' })
  createdAt: Date;

  @SwaggerString({ example: '2026-04-03T00:00:00Z' })
  updatedAt: Date;
}
