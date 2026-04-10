import {
  CategoryContentSummaryDto,
  CategoryContentSummaryListDto,
  CategoryListDto,
  CategoryResponseDto,
  CategoryType,
  GetCategoriesDto,
  GetCategoryByIdDto,
  GetExerciseCountByCategoryTypeDto,
} from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PackStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  1.1 — GET CATEGORIES (có thể filter theo type)
  // ═══════════════════════════════════════════════════════════════════════════

  async getCategories(payload: GetCategoriesDto): Promise<CategoryListDto> {
    const where = payload.type ? { type: payload.type } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: [{ type: 'asc' }, { order: 'asc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    this.logger.log(`getCategories: type=${payload.type ?? 'ALL'}, found=${total}`);

    return {
      items: items.map(this.toResponse),
      total,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  1.2 — GET CATEGORY BY ID
  // ═══════════════════════════════════════════════════════════════════════════

  async getCategoryById(payload: GetCategoryByIdDto): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: payload.id },
    });

    if (!category) {
      throw new NotFoundException(`Category not found: id=${payload.id}`);
    }

    this.logger.log(`getCategoryById: id=${payload.id}`);
    return this.toResponse(category);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  1.3 — GET CATEGORIES CONTENT SUMMARY
  //  Trả về mẫu số (totalPacks, totalExercises) theo từng CategoryType.
  //  Dùng để tính categoryProgress trên Dashboard:
  //    categoryProgress = passedExercises / totalExercises × 100
  // ═══════════════════════════════════════════════════════════════════════════

  async getCategoriesContentSummary(): Promise<CategoryContentSummaryListDto> {
    // Lấy tất cả categories kèm _count lessonPacks PUBLISHED
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        type: true,
        _count: {
          select: {
            lessonPacks: {
              where: { status: PackStatus.PUBLISHED },
            },
          },
        },
      },
    });

    // Group categoryIds theo type để query exercises
    const categoryIdsByType: Record<string, string[]> = {
      [CategoryType.EVERYDAY]: [],
      [CategoryType.OFFICE]: [],
      [CategoryType.NICHE]: [],
    };

    const packCountByType: Record<string, number> = {
      [CategoryType.EVERYDAY]: 0,
      [CategoryType.OFFICE]: 0,
      [CategoryType.NICHE]: 0,
    };

    for (const cat of categories) {
      categoryIdsByType[cat.type].push(cat.id);
      packCountByType[cat.type] += cat._count.lessonPacks;
    }

    // Đếm exercises song song cho cả 3 types
    const [everydayExercises, officeExercises, nicheExercises] = await this.prisma.$transaction([
      this.prisma.exercise.count({
        where: {
          lessonPack: {
            categoryId: { in: categoryIdsByType[CategoryType.EVERYDAY] },
            status: PackStatus.PUBLISHED,
          },
        },
      }),
      this.prisma.exercise.count({
        where: {
          lessonPack: {
            categoryId: { in: categoryIdsByType[CategoryType.OFFICE] },
            status: PackStatus.PUBLISHED,
          },
        },
      }),
      this.prisma.exercise.count({
        where: {
          lessonPack: {
            categoryId: { in: categoryIdsByType[CategoryType.NICHE] },
            status: PackStatus.PUBLISHED,
          },
        },
      }),
    ]);

    const exerciseCountByType: Record<string, number> = {
      [CategoryType.EVERYDAY]: everydayExercises,
      [CategoryType.OFFICE]: officeExercises,
      [CategoryType.NICHE]: nicheExercises,
    };

    const items: CategoryContentSummaryDto[] = Object.values(CategoryType).map((type) => ({
      type,
      totalPacks: packCountByType[type] ?? 0,
      totalExercises: exerciseCountByType[type] ?? 0,
    }));

    this.logger.log(
      `getCategoriesContentSummary: ${JSON.stringify(items.map((i) => ({ type: i.type, packs: i.totalPacks, exercises: i.totalExercises })))}`,
    );

    return { items };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  1.3 — GET TOTAL EXERCISES PER CATEGORY TYPE
  //  Trả về tổng số Exercise thuộc một CategoryType cụ thể.
  //  Dùng làm mẫu số: categoryProgress = passedExercises / totalExercises × 100
  //  (BR-05 — Dashboard Section B, FR-B02)
  // ═══════════════════════════════════════════════════════════════════════════

  async getTotalExercisesPerCategory(
    payload: GetExerciseCountByCategoryTypeDto,
  ): Promise<{ type: CategoryType; totalExercises: number }> {
    const type = payload.type;

    // Lấy tất cả categoryIds thuộc type này
    const categories = await this.prisma.category.findMany({
      where: { type },
      select: { id: true },
    });

    const categoryIds = categories.map((c) => c.id);

    const totalExercises = await this.prisma.exercise.count({
      where: {
        lessonPack: {
          categoryId: { in: categoryIds },
          status: PackStatus.PUBLISHED,
        },
      },
    });

    this.logger.log(`getTotalExercisesPerCategory: type=${type}, total=${totalExercises}`);

    return { type, totalExercises };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAPPER
  // ═══════════════════════════════════════════════════════════════════════════

  private toResponse(category: any): CategoryResponseDto {
    return {
      id: category.id,
      code: category.code ?? null,
      name: category.name,
      type: category.type as CategoryType,
      subCategory: category.subCategory ?? null,
      order: category.order,
      description: category.description ?? null,
    };
  }
}
