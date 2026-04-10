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
import { SwaggerEnum, SwaggerNumber, SwaggerString } from '../decorators/swagger.decorator';

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum CategoryType {
  EVERYDAY = 'EVERYDAY',
  OFFICE = 'OFFICE',
  NICHE = 'NICHE',
}

export enum PackStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AttemptStatus {
  PENDING = 'PENDING',
  TRANSCRIBED = 'TRANSCRIBED',
  TRANSCRIPT_FAILED = 'TRANSCRIPT_FAILED',
}

export enum PackAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SCORING = 'SCORING',
  SCORED = 'SCORED',
}

export enum ScoringStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ScoringMode {
  FREE = 'FREE',
  GUIDED = 'GUIDED',
}

// ─── PAYLOADS ─────────────────────────────────────────────────────────────────

export class GetCategoryByIdDto {
  @SwaggerString({ example: 'uuid-abc-123' })
  id: string;
}

/** Dùng cho getCategories — type là optional (filter) */
export class GetCategoriesDto {
  @SwaggerEnum({
    enum: CategoryType,
    required: false,
    example: CategoryType.EVERYDAY,
    description: 'Lọc theo loại danh mục (EVERYDAY | OFFICE | NICHE)',
  })
  type?: CategoryType;
}

/** Dùng cho getTotalExercisesPerCategory — type là bắt buộc */
export class GetExerciseCountByCategoryTypeDto {
  @SwaggerEnum({
    enum: CategoryType,
    example: CategoryType.EVERYDAY,
    description: 'Loại danh mục cần đếm (EVERYDAY | OFFICE | NICHE)',
  })
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

  @SwaggerEnum({ enum: CategoryType, example: CategoryType.EVERYDAY })
  type: CategoryType;

  @SwaggerString({ required: false, example: 'HEALTHCARE' })
  subCategory: string | null;

  @SwaggerNumber({ example: 1, description: 'Thứ tự hiển thị' })
  order: number;

  @SwaggerString({ required: false, example: 'Các chủ đề giao tiếp hàng ngày' })
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
  @SwaggerEnum({ enum: CategoryType, example: CategoryType.EVERYDAY })
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
  @SwaggerNumber({ example: 1, description: 'Level ID (1–4)' })
  id: number;
}

export class GetTotalExercisesPerLevelDto {
  @SwaggerEnum({ enum: CategoryType, example: CategoryType.EVERYDAY })
  categoryType: CategoryType;

  @SwaggerNumber({ example: 1, description: 'Level ID (1–4)' })
  levelId: number;
}

// ─── LEVEL RESPONSES ──────────────────────────────────────────────────────────

export class LevelResponseDto {
  @SwaggerNumber({ example: 1, description: 'Level ID (1–4)' })
  id: number;

  @SwaggerString({ required: false, example: 'Người mới bắt đầu' })
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
  @SwaggerEnum({ enum: CategoryType })
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

  @SwaggerEnum({
    enum: PackStatus,
    required: false,
    example: PackStatus.PUBLISHED,
    description: 'Trạng thái hiển thị của một bộ bài tập',
  })
  status?: PackStatus;

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
    description: 'Danh sách pack IDs (max 50). Thứ tự response giữ nguyên thứ tự IDs.',
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

  @SwaggerEnum({ enum: PackStatus, example: PackStatus.PUBLISHED, description: 'Trạng thái pack' })
  status: PackStatus;
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

  @SwaggerEnum({ enum: PackStatus, example: PackStatus.PUBLISHED })
  status: PackStatus;

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

  @SwaggerString({
    example: 'SPEAKING',
    description: 'Loại exercise (SPEAKING | WRITING | ...)',
  })
  type: string;

  @ApiProperty({ example: 'Describe your daily routine in 3 sentences.' })
  prompt: string;

  @SwaggerString({
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

// ─── START PACK PAYLOADS & RESPONSES ─────────────────────────────────────────

/**
 * Payload nội bộ RMQ: gateway → content-service.
 * Khi user bấm "Bắt đầu" pack → tạo PackAttempt + N ExerciseAttempt (PENDING).
 * TODO: logic trừ credit sẽ nằm ở đây sau.
 */
export class StartPackPayload {
  @SwaggerString({ example: 'uuid-pack-123' })
  packId: string;

  @SwaggerString({ example: 'uuid-user-123' })
  userId: string;
}

export class StartPackResponseDto {
  @ApiProperty({ example: true, description: 'True nếu là phiên mới, False nếu resume phiên cũ' })
  isNew: boolean;

  @SwaggerString({ example: 'uuid-pack-attempt-123' })
  packAttemptId: string;

  @ApiProperty({
    type: [Object],
    description: 'Danh sách exercise attempts',
    example: [
      {
        exerciseAttemptId: 'uuid-1',
        exerciseId: 'uuid-ex-1',
        sequenceOrder: 1,
        status: AttemptStatus.PENDING,
        audioPath: 'path/to/audio.m4a',
      },
    ],
  })
  exercises: Array<{
    exerciseAttemptId: string;
    exerciseId: string;
    sequenceOrder: number;
    status: AttemptStatus;
    audioPath?: string;
  }>;
}

// ─── EXERCISE ATTEMPT PAYLOADS ───────────────────────────────────────────────

/**
 * FE gửi lên gateway sau khi upload audio xong.
 * audioId = Media record ID (từ media-service) → content-svc tự resolve URL.
 */
export class SubmitExerciseAudioDto {
  @SwaggerString({ example: 'uuid-media-123' })
  audioId: string;

  @ApiProperty({ example: 3500, description: 'Thời lượng audio (ms)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMs?: number;
}

/**
 * Payload nội bộ RMQ: gateway → content-service.
 * Gateway bổ sung attemptId + userId từ route param + JWT.
 */
export class SubmitExerciseAudioPayload {
  @SwaggerString({ example: 'uuid-exercise-attempt-123' })
  exerciseAttemptId: string;

  @SwaggerString({ example: 'uuid-user-123' })
  userId: string;

  @SwaggerString({ example: 'uuid-media-123' })
  audioId: string;

  @ApiProperty({ required: false, example: 3500 })
  @IsOptional()
  @IsInt()
  durationMs?: number;
}

// ─── EXERCISE ATTEMPT RESPONSES ──────────────────────────────────────────────

export class SubmitExerciseAudioResponseDto {
  @SwaggerString({ example: 'uuid-exercise-attempt-123' })
  exerciseAttemptId: string;

  @ApiProperty({ example: 'I work as a software engineer.' })
  transcript: string;

  @ApiProperty({ example: 'exercise-audio/abc.m4a' })
  audioPath: string;
}

// ─── PACK SCORING PAYLOADS ───────────────────────────────────────────────────

export class ScorePackDto {
  @SwaggerEnum({
    enum: ScoringMode,
    example: ScoringMode.FREE,
    description: 'Chế độ chấm điểm (FREE | GUIDED)',
  })
  mode: ScoringMode;
}

export class ScorePackPayload {
  @SwaggerString({ example: 'uuid-pack-attempt-123' })
  packAttemptId: string;

  @SwaggerString({ example: 'uuid-user-123' })
  userId: string;

  @SwaggerEnum({ enum: ScoringMode, example: ScoringMode.FREE })
  mode: ScoringMode;
}

export class ScorePackResponseDto {
  @SwaggerString({ example: 'uuid-pack-attempt-123' })
  packAttemptId: string;

  @SwaggerEnum({ enum: ScoringStatus, example: ScoringStatus.PROCESSING })
  status: ScoringStatus;

  @SwaggerEnum({ enum: ScoringMode, example: ScoringMode.FREE })
  mode: ScoringMode;

  @SwaggerNumber({ example: 5 })
  exerciseCount: number;
}

export class PackScoringResponseDto {
  @SwaggerString({ example: 'uuid-pack-attempt-123' })
  packAttemptId: string;

  @ApiProperty({ example: 85 })
  overallScore: number;

  @ApiProperty({ example: true })
  passed: boolean;

  @SwaggerEnum({ enum: ScoringMode })
  scoringMode: ScoringMode;

  @ApiProperty({ type: Date })
  scoredAt: Date;

  @ApiProperty({ type: [Object] })
  exercises: Array<{
    exerciseId: string;
    seq: number;
    score: number;
    criterion1: { score: number; feedback: string };
    grammar: { score: number; feedback: string };
    vocabulary: { score: number; feedback: string };
    tasks?: any;
    suggestedPhrases?: string[];
  }>;
}

// ─── USER PRACTICE STATS ──────────────────────────────────────────────────────

export class CategoryStatsDto {
  @SwaggerEnum({ enum: CategoryType, example: CategoryType.EVERYDAY })
  type: CategoryType;

  @SwaggerNumber({ example: 120, description: 'Tổng số pack PUBLISHED trong category' })
  totalPacks: number;

  @SwaggerNumber({ example: 2, description: 'Số pack user đã passed' })
  passedPacks: number;

  @SwaggerNumber({ example: 1, description: 'passedPacks / totalPacks × 100' })
  completionPercent: number;
}

export class LevelStatsDto {
  @SwaggerNumber({ example: 1 })
  id: number;

  @SwaggerString({ example: 'EVERYDAY' })
  categoryType: string;

  @SwaggerNumber({ example: 40, description: 'Tổng số pack PUBLISHED trong level × category' })
  totalPacks: number;

  @SwaggerNumber({ example: 2, description: 'Số pack user đã passed' })
  passedPacks: number;

  @SwaggerNumber({ example: 5, description: 'passedPacks / totalPacks × 100' })
  completionPercent: number;
}

export class UserPracticeStatsResponseDto {
  @ApiProperty({ type: [CategoryStatsDto] })
  categories: CategoryStatsDto[];

  @ApiProperty({ type: [LevelStatsDto] })
  levels: LevelStatsDto[];
}

// ─── SUGGESTED CATEGORY ──────────────────────────────────────────────────────

export class GetSuggestedCategoryDto {
  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EVERYDAY,
    description: 'Loại category đang chọn',
  })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  categoryType: CategoryType;

  @ApiProperty({ example: 1, description: 'Level ID đang chọn (1–3)' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  levelId: number;
}

export class SuggestedCategoryPackDto {
  @SwaggerString({ example: 'uuid-pack-123' })
  packId: string;

  @SwaggerString({ example: 'Daily Shopping' })
  title: string;

  @SwaggerNumber({ example: 85, description: 'Điểm overallScore (null nếu chưa scored)' })
  overallScore: number | null;

  @ApiProperty({
    example: 'SCORED',
    description: 'Trạng thái: SCORED = hoàn thành, null = chưa làm',
    required: false,
  })
  status: string | null;
}

export class SuggestedCategoryResponseDto {
  @SwaggerString({ example: 'uuid-category-123' })
  categoryId: string;

  @SwaggerString({ example: 'Tiếng Anh Giao Tiếp' })
  categoryName: string;

  @ApiProperty({ required: false, example: 'Các chủ đề giao tiếp hàng ngày' })
  categoryDescription: string | null;

  @SwaggerNumber({ example: 8, description: 'Tổng số pack PUBLISHED trong category × level' })
  totalPacks: number;

  @SwaggerNumber({ example: 5, description: 'Số pack user đã hoàn thành (SCORED)' })
  scoredPacks: number;

  @SwaggerNumber({ example: 78, description: 'Điểm trung bình các pack đã scored' })
  averageScore: number;

  @SwaggerNumber({ example: 62, description: 'scoredPacks / totalPacks × 100' })
  completionPercent: number;

  @ApiProperty({
    type: [SuggestedCategoryPackDto],
    description: 'Danh sách pack trong category: đã scored + chưa làm',
  })
  packs: SuggestedCategoryPackDto[];
}
