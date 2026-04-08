import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CategoryType,
  GetLevelByIdDto,
  GetTotalExercisesPerLevelDto,
  LevelExerciseCountDto,
  LevelListDto,
  LevelResponseDto,
} from '@app/common';
import { PackStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LevelService {
  private readonly logger = new Logger(LevelService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  2.1 — GET LEVELS
  //  List 4 levels với passThresholdScore & description.
  //  Dùng cho FR-B03 (chips level) và BR-01 (ngưỡng pass).
  // ═══════════════════════════════════════════════════════════════════════════

  async getLevels(): Promise<LevelListDto> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.level.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.level.count(),
    ]);

    this.logger.log(`getLevels: found=${total}`);
    return { items: items.map(this.toResponse), total };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  2.2 — GET LEVEL BY ID
  //  Trả về đầy đủ thông tin level kèm outputRequirements & examples.
  //  Dùng nội bộ để lấy passThresholdScore khi tính passed exercise (BR-01).
  // ═══════════════════════════════════════════════════════════════════════════

  async getLevelById(payload: GetLevelByIdDto): Promise<LevelResponseDto> {
    const level = await this.prisma.level.findUnique({
      where: { id: payload.id },
    });

    if (!level) {
      throw new NotFoundException(`Level not found: id=${payload.id}`);
    }

    this.logger.log(`getLevelById: id=${payload.id}`);
    return this.toResponse(level);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  2.3 — GET TOTAL EXERCISES PER LEVEL
  //  Đếm tổng số Exercise PUBLISHED trong một Level × CategoryType cụ thể.
  //  Dùng làm mẫu số: levelProgress = passedExercises / totalExercises × 100
  //  (FR-B04, FR-B07)
  // ═══════════════════════════════════════════════════════════════════════════

  async getTotalExercisesPerLevel(
    payload: GetTotalExercisesPerLevelDto,
  ): Promise<LevelExerciseCountDto> {
    const { categoryType, levelId } = payload;

    // Lấy tất cả categoryIds thuộc type này
    const categories = await this.prisma.category.findMany({
      where: { type: categoryType },
      select: { id: true },
    });

    const categoryIds = categories.map((c) => c.id);

    const totalExercises = await this.prisma.exercise.count({
      where: {
        lessonPack: {
          categoryId: { in: categoryIds },
          levelId,
          status: PackStatus.PUBLISHED,
        },
      },
    });

    this.logger.log(
      `getTotalExercisesPerLevel: categoryType=${categoryType}, levelId=${levelId}, total=${totalExercises}`,
    );

    return {
      categoryType: categoryType as CategoryType,
      levelId,
      totalExercises,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAPPER
  // ═══════════════════════════════════════════════════════════════════════════

  private toResponse(level: any): LevelResponseDto {
    return {
      id: level.id,
      description: level.description ?? null,
      passThresholdScore: level.passThresholdScore,
      outputRequirements: level.outputRequirements as Record<string, any>,
      examples: level.examples as any[],
    };
  }
}
