import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
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

// ─── LEVEL PAYLOADS ───────────────────────────────────────────────────────────

export class GetLevelByIdDto {
  @ApiProperty({ example: 1, description: 'Level ID (1–4)' })
  @IsNotEmpty()
  id: number;
}

export class GetTotalExercisesPerLevelDto {
  @ApiProperty({ enum: CategoryType, example: CategoryType.EVERYDAY })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  categoryType: CategoryType;

  @ApiProperty({ example: 1, description: 'Level ID (1–4)' })
  @IsNotEmpty()
  levelId: number;
}

// ─── LEVEL RESPONSES ──────────────────────────────────────────────────────────

export class LevelResponseDto {
  @SwaggerNumber({ example: 1, description: 'Level ID (1–4)' })
  id: number;

  @ApiProperty({ required: false, example: 'Người mới bắt đầu' })
  @IsOptional()
  @IsString()
  description: string | null;

  @SwaggerNumber({ example: 60, description: 'Điểm tối thiểu để pass level' })
  passThresholdScore: number;

  @ApiProperty({
    type: Object,
    description: 'Cấu trúc yêu cầu đầu ra (ngữ pháp, từ vựng...)',
  })
  outputRequirements: Record<string, any>;

  @ApiProperty({ type: [Object], description: 'Danh sách ví dụ minh họa' })
  examples: any[];
}

export class LevelListDto {
  @ApiProperty({ type: [LevelResponseDto] })
  items: LevelResponseDto[];

  @SwaggerNumber({ description: 'Tổng số levels' })
  total: number;
}

export class LevelExerciseCountDto {
  @ApiProperty({ enum: CategoryType })
  categoryType: CategoryType;

  @SwaggerNumber({ example: 2 })
  levelId: number;

  @SwaggerNumber({ description: 'Tổng số Exercise PUBLISHED trong level này' })
  totalExercises: number;
}

// ─── LESSON PACK PAYLOADS ─────────────────────────────────────────────────────

/**
 * 3.1 — Filter khi lấy danh sách packs.
 * Dùng cho màn "Xem tất cả" bài học trong một level / category.
 */
export class GetPacksDto {
  @ApiProperty({ required: false, example: 'uuid-category-123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, example: 2, description: 'Level ID (1–4)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  levelId?: number;

  @ApiProperty({
    enum: CategoryType,
    required: false,
    example: CategoryType.EVERYDAY,
    description: 'Filter theo category type (join qua Category)',
  })
  @IsOptional()
  @IsEnum(CategoryType)
  categoryType?: CategoryType;

  @ApiProperty({
    required: false,
    example: 'PUBLISHED',
    description: 'PackStatus — mặc định PUBLISHED',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    required: false,
    example: 20,
    description: 'Số item mỗi trang',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiProperty({
    required: false,
    example: 0,
    description: 'Skip (pagination offset)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

/** 3.2 — Lấy chi tiết 1 pack theo ID */
export class GetPackByIdDto {
  @SwaggerString({ example: 'uuid-pack-123' })
  id: string;
}

/**
 * 3.3 — Batch fetch nhiều packs theo danh sách IDs.
 * Dùng cho Section 4 (recent packs): user-service trả packIds, content-service trả pack info.
 * Giới hạn 50 IDs để tránh query quá lớn.
 */
export class GetPacksByIdsDto {
  @ApiProperty({
    type: [String],
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description:
      'Danh sách pack IDs (max 50). Thứ tự response giữ nguyên thứ tự IDs.',
    maxItems: 50,
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: false, message: 'Tối đa 50 IDs mỗi lần' })
  ids: string[];
}

/**
 * 3.4 — Đếm tổng packs + exercises trong category × level (mẫu số Section 3).
 * completionPercent = completedPacks / totalPacks × 100
 */
export class GetPackStatsByCategoryAndLevelDto {
  @SwaggerString({ example: 'uuid-category-123' })
  categoryId: string;

  @ApiProperty({ example: 2, description: 'Level ID (1–4)' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  levelId: number;
}

/** 3.5 — Lấy tất cả exercises trong một pack (dùng khi bắt đầu làm bài) */
export class GetPackExercisesDto {
  @SwaggerString({ example: 'uuid-pack-123' })
  packId: string;
}

// ─── LESSON PACK RESPONSES ────────────────────────────────────────────────────

/**
 * Summary của 1 LessonPack — dùng trong list views.
 * Không chứa exercises (tránh payload quá nặng).
 */
export class LessonPackSummaryDto {
  @SwaggerString({ example: 'uuid-pack-123' })
  id: string;

  @SwaggerString({ example: 'Daily Shopping' })
  title: string;

  @ApiProperty({
    required: false,
    example: 'Mua sắm trong cuộc sống hàng ngày',
  })
  description: string | null;

  @SwaggerString({ example: 'uuid-category-123' })
  categoryId: string;

  @ApiProperty({ required: false, example: 'Everyday - Daily Life' })
  categoryName: string | null;

  @ApiProperty({
    enum: CategoryType,
    required: false,
    example: CategoryType.EVERYDAY,
  })
  categoryType: CategoryType | null;

  @SwaggerNumber({ example: 2, description: 'Level ID (1–4)' })
  levelId: number;

  @SwaggerNumber({ example: 5, description: 'Tổng số Exercise trong pack' })
  totalExercises: number;

  @ApiProperty({ example: 'PUBLISHED', description: 'Trạng thái pack' })
  status: string;
}

export class PackListDto {
  @ApiProperty({ type: [LessonPackSummaryDto] })
  items: LessonPackSummaryDto[];

  @SwaggerNumber({ description: 'Tổng số pack (dùng cho pagination)' })
  total: number;
}

/**
 * Detail của 1 LessonPack — dùng khi user bấm play.
 * Bao gồm thêm level info để frontend biết passThresholdScore.
 */
export class LessonPackDetailDto {
  @SwaggerString({ example: 'uuid-pack-123' })
  id: string;

  @SwaggerString({ example: 'Daily Shopping' })
  title: string;

  @ApiProperty({
    required: false,
    example: 'Mua sắm trong cuộc sống hàng ngày',
  })
  description: string | null;

  @SwaggerString({ example: 'uuid-category-123' })
  categoryId: string;

  @ApiProperty({ required: false, example: 'Everyday - Daily Life' })
  categoryName: string | null;

  @ApiProperty({
    enum: CategoryType,
    required: false,
    example: CategoryType.EVERYDAY,
  })
  categoryType: CategoryType | null;

  @SwaggerNumber({ example: 2, description: 'Level ID (1–4)' })
  levelId: number;

  @ApiProperty({ required: false, example: 'Elementary' })
  levelDescription: string | null;

  @ApiProperty({
    required: false,
    example: 60,
    description: 'Điểm tối thiểu để pass pack',
  })
  passThresholdScore: number | null;

  @SwaggerNumber({ example: 5, description: 'Tổng số Exercise trong pack' })
  totalExercises: number;

  @ApiProperty({ example: 'PUBLISHED' })
  status: string;

  @SwaggerNumber({ example: 120, description: 'Tổng số lần play' })
  totalPlays: number;

  @ApiProperty({
    required: false,
    example: 4.5,
    description: 'Điểm đánh giá TB (1–5)',
  })
  averageRating: number | null;
}

/**
 * Mẫu số cho Section 3 overview.
 * Dùng để tính: completionPercent = completedPacks / totalPacks × 100
 */
export class PackStatsDto {
  @SwaggerString({ example: 'uuid-category-123' })
  categoryId: string;

  @SwaggerNumber({ example: 2, description: 'Level ID (1–4)' })
  levelId: number;

  @SwaggerNumber({
    example: 8,
    description: 'Tổng số pack PUBLISHED trong category × level',
  })
  totalPacks: number;

  @SwaggerNumber({
    example: 40,
    description: 'Tổng số exercise PUBLISHED trong category × level',
  })
  totalExercises: number;
}

// ─── EXERCISE RESPONSES ───────────────────────────────────────────────────────

/**
 * Summary của 1 Exercise — trả về khi GET /packs/:id/exercises.
 * Chứa đủ dữ liệu để frontend render câu hỏi + options.
 */
export class ExerciseSummaryDto {
  @SwaggerString({ example: 'uuid-exercise-123' })
  id: string;

  @SwaggerString({ example: 'uuid-pack-123' })
  lessonPackId: string;

  @SwaggerNumber({ example: 1, description: 'Thứ tự câu trong pack (1–5)' })
  order: number;

  @ApiProperty({
    example: 'SPEAKING',
    description: 'Loại exercise (SPEAKING | WRITING | ...)',
  })
  type: string;

  @ApiProperty({ example: 'Describe your daily routine in 3 sentences.' })
  prompt: string;

  @ApiProperty({
    required: false,
    example: 'https://cdn.example.com/audio.mp3',
  })
  mediaUrl: string | null;

  @ApiProperty({ type: [Object], description: 'Danh sách options (nếu có)' })
  options: any[];

  @ApiProperty({ example: 'I wake up at 7am every day.' })
  correctAnswer: string;

  @ApiProperty({
    required: false,
    example: 'Dùng Present Simple cho thói quen hàng ngày',
  })
  explanation: string | null;
}

export class ExerciseListDto {
  @ApiProperty({ type: [ExerciseSummaryDto] })
  items: ExerciseSummaryDto[];

  @SwaggerNumber({ description: 'Tổng số exercise trong pack' })
  total: number;
}
