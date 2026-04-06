import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SwaggerNumber, SwaggerString } from '../decorators/swagger.decorator';

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum CategoryType {
  EVERYDAY = 'EVERYDAY',
  OFFICE = 'OFFICE',
  NICHE = 'NICHE',
}

// ─── PAYLOADS ─────────────────────────────────────────────────────────────────

export class GetCategoryByIdDto {
  @SwaggerString({ example: 'uuid-abc-123' })
  id: string;
}

/** Dùng cho getCategories — type là optional (filter) */
export class GetCategoriesDto {
  @ApiProperty({
    enum: CategoryType,
    required: false,
    example: CategoryType.EVERYDAY,
    description: 'Lọc theo loại danh mục (EVERYDAY | OFFICE | NICHE)',
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}

/** Dùng cho getTotalExercisesPerCategory — type là bắt buộc */
export class GetExerciseCountByCategoryTypeDto {
  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EVERYDAY,
    description: 'Loại danh mục cần đếm (EVERYDAY | OFFICE | NICHE)',
  })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;
}

// ─── RESPONSES ────────────────────────────────────────────────────────────────

export class CategoryResponseDto {
  @SwaggerString({ example: 'uuid-abc-123' })
  id: string;

  @ApiProperty({ required: false, example: 'EVERYDAY_DAILY_LIFE' })
  @IsOptional()
  @IsString()
  code: string | null;

  @SwaggerString({ example: 'Tiếng Anh Giao Tiếp' })
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EVERYDAY })
  type: CategoryType;

  @ApiProperty({ required: false, example: 'HEALTHCARE' })
  @IsOptional()
  @IsString()
  subCategory: string | null;

  @SwaggerNumber({ example: 1, description: 'Thứ tự hiển thị' })
  order: number;

  @ApiProperty({ required: false, example: 'Các chủ đề giao tiếp hàng ngày' })
  @IsOptional()
  @IsString()
  description: string | null;
}

export class CategoryListDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  items: CategoryResponseDto[];

  @SwaggerNumber({ description: 'Tổng số danh mục' })
  total: number;
}

/**
 * Dùng cho dashboard: mẫu số tính categoryProgress
 * categoryProgress = passedExercises / totalExercises × 100
 */
export class CategoryContentSummaryDto {
  @ApiProperty({ enum: CategoryType, example: CategoryType.EVERYDAY })
  type: CategoryType;

  @SwaggerNumber({ description: 'Tổng số LessonPack PUBLISHED thuộc type này' })
  totalPacks: number;

  @SwaggerNumber({ description: 'Tổng số Exercise thuộc type này' })
  totalExercises: number;
}

export class CategoryContentSummaryListDto {
  @ApiProperty({ type: [CategoryContentSummaryDto] })
  items: CategoryContentSummaryDto[];
}
