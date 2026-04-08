import {
  CategoryType,
  ExerciseSummaryDto,
  ExerciseListDto,
  GetPackByIdDto,
  GetPackExercisesDto,
  GetPacksByIdsDto,
  GetPacksDto,
  GetPackStatsByCategoryAndLevelDto,
  LessonPackDetailDto,
  LessonPackSummaryDto,
  PackListDto,
  PackStatsDto,
} from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PackStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonPackService {
  private readonly logger = new Logger(LessonPackService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  3.1 — GET PACKS (list với filter)
  //  Filter: categoryId | levelId | categoryType | status
  //  Dùng cho: "Xem tất cả" bài học trong level
  // ═══════════════════════════════════════════════════════════════════════════

  async getPacks(payload: GetPacksDto): Promise<PackListDto> {
    const { categoryId, levelId, categoryType, status, limit = 20, offset = 0 } =
      payload;

    // Build where clause
    const where: any = {
      status: status ?? PackStatus.PUBLISHED,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (levelId) {
      where.levelId = levelId;
    }

    // Filter by categoryType — join qua Category
    if (categoryType) {
      where.category = { type: categoryType };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lessonPack.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: offset,
        take: limit,
        include: {
          category: { select: { id: true, name: true, type: true } },
          _count: { select: { exercises: true } },
        },
      }),
      this.prisma.lessonPack.count({ where }),
    ]);

    this.logger.log(
      `getPacks: categoryType=${categoryType ?? 'ALL'}, levelId=${levelId ?? 'ALL'}, total=${total}`,
    );

    return {
      items: items.map(this.toSummary),
      total,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  3.2 — GET PACK BY ID
  //  Trả về thông tin đầy đủ của 1 pack.
  //  Dùng khi user bấm vào play button.
  // ═══════════════════════════════════════════════════════════════════════════

  async getPackById(payload: GetPackByIdDto): Promise<LessonPackDetailDto> {
    const pack = await this.prisma.lessonPack.findUnique({
      where: { id: payload.id },
      include: {
        category: { select: { id: true, name: true, type: true } },
        level: { select: { id: true, description: true, passThresholdScore: true } },
        _count: { select: { exercises: true } },
      },
    });

    if (!pack) {
      throw new NotFoundException(`LessonPack not found: id=${payload.id}`);
    }

    this.logger.log(`getPackById: id=${payload.id}`);
    return this.toDetail(pack);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  3.3 — GET PACKS BY IDS (batch fetch)
  //  Dùng cho Section 4 — recent packs:
  //    1. user-service trả về [{ packId, score, status, ... }]
  //    2. content-service trả về pack info theo IDs đó
  //  Thứ tự items trong response giữ nguyên thứ tự ids truyền vào.
  // ═══════════════════════════════════════════════════════════════════════════

  async getPacksByIds(payload: GetPacksByIdsDto): Promise<{ items: LessonPackSummaryDto[] }> {
    const { ids } = payload;

    if (!ids || ids.length === 0) {
      return { items: [] };
    }

    const packs = await this.prisma.lessonPack.findMany({
      where: { id: { in: ids } },
      include: {
        category: { select: { id: true, name: true, type: true } },
        _count: { select: { exercises: true } },
      },
    });

    // Giữ nguyên thứ tự theo ids truyền vào (user-service sort by lastPlayedAt)
    const packMap = new Map(packs.map((p) => [p.id, p]));
    const ordered = ids
      .map((id) => packMap.get(id))
      .filter(Boolean);

    this.logger.log(`getPacksByIds: requested=${ids.length}, found=${packs.length}`);

    return { items: ordered.map(this.toSummary) };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  3.4 — GET PACK STATS BY CATEGORY AND LEVEL
  //  Đếm tổng packs + exercises PUBLISHED trong một category × level.
  //  Dùng làm mẫu số cho Section 3 overview:
  //    completionPercent = (completedPacks / totalPacks) × 100
  //    exerciseProgress  = (completedExercises / totalExercises) × 100
  // ═══════════════════════════════════════════════════════════════════════════

  async getPackStatsByCategoryAndLevel(
    payload: GetPackStatsByCategoryAndLevelDto,
  ): Promise<PackStatsDto> {
    const { categoryId, levelId } = payload;

    const where = {
      categoryId,
      levelId,
      status: PackStatus.PUBLISHED,
    };

    const [totalPacks, totalExercises] = await this.prisma.$transaction([
      this.prisma.lessonPack.count({ where }),
      this.prisma.exercise.count({
        where: { lessonPack: where },
      }),
    ]);

    this.logger.log(
      `getPackStatsByCategoryAndLevel: categoryId=${categoryId}, levelId=${levelId}, packs=${totalPacks}, exercises=${totalExercises}`,
    );

    return { categoryId, levelId, totalPacks, totalExercises };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  3.5 — GET PACK EXERCISES
  //  Trả về toàn bộ exercises trong một pack.
  //  Dùng khi user bắt đầu làm bài (play screen).
  // ═══════════════════════════════════════════════════════════════════════════

  async getPackExercises(payload: GetPackExercisesDto): Promise<ExerciseListDto> {
    // Verify pack tồn tại
    const pack = await this.prisma.lessonPack.findUnique({
      where: { id: payload.packId },
      select: { id: true },
    });

    if (!pack) {
      throw new NotFoundException(`LessonPack not found: id=${payload.packId}`);
    }

    const exercises = await this.prisma.exercise.findMany({
      where: { lessonPackId: payload.packId },
      orderBy: { order: 'asc' },
    });

    this.logger.log(
      `getPackExercises: packId=${payload.packId}, count=${exercises.length}`,
    );

    return {
      items: exercises.map(this.toExerciseSummary),
      total: exercises.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private toSummary(pack: any): LessonPackSummaryDto {
    return {
      id: pack.id,
      title: pack.title,
      description: pack.description ?? null,
      categoryId: pack.categoryId,
      categoryName: pack.category?.name ?? null,
      categoryType: pack.category?.type as CategoryType ?? null,
      levelId: pack.levelId,
      totalExercises: pack._count?.exercises ?? 0,
      status: pack.status,
    };
  }

  private toDetail(pack: any): LessonPackDetailDto {
    return {
      id: pack.id,
      title: pack.title,
      description: pack.description ?? null,
      categoryId: pack.categoryId,
      categoryName: pack.category?.name ?? null,
      categoryType: pack.category?.type as CategoryType ?? null,
      levelId: pack.levelId,
      levelDescription: pack.level?.description ?? null,
      passThresholdScore: pack.level?.passThresholdScore ?? null,
      totalExercises: pack._count?.exercises ?? 0,
      status: pack.status,
      totalPlays: pack.totalPlays ?? 0,
      averageRating: pack.averageRating ?? null,
    };
  }

  private toExerciseSummary(exercise: any): ExerciseSummaryDto {
    return {
      id: exercise.id,
      lessonPackId: exercise.lessonPackId,
      order: exercise.order,
      type: exercise.type,
      prompt: exercise.prompt,
      mediaUrl: exercise.mediaUrl ?? null,
      options: exercise.options as any[] ?? [],
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation ?? null,
    };
  }
}
