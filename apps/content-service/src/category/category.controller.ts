import {
  CONTENT_COMMANDS,
  GetCategoriesDto,
  GetCategoryByIdDto,
  GetExerciseCountByCategoryTypeDto,
  RmqInterceptor,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // ── 1.1 GET /categories ─────────────────────────────────────────────────────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_CATEGORIES })
  getCategories(@Payload() payload: GetCategoriesDto) {
    return this.categoryService.getCategories(payload);
  }

  // ── 1.2 GET /categories/:id ─────────────────────────────────────────────────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_CATEGORY_BY_ID })
  getCategoryById(@Payload() payload: GetCategoryByIdDto) {
    return this.categoryService.getCategoryById(payload);
  }

  // ── 1.3 GET total exercises per category type (BR-05 mẫu số) ────────────────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_TOTAL_EXERCISES_PER_CATEGORY })
  getTotalExercisesPerCategory(
    @Payload() payload: GetExerciseCountByCategoryTypeDto,
  ) {
    return this.categoryService.getTotalExercisesPerCategory(payload);
  }

  // ── 1.4 GET /categories/content-summary (tất cả 3 types cùng lúc) ───────────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_CATEGORIES_CONTENT_SUMMARY })
  getCategoriesContentSummary() {
    return this.categoryService.getCategoriesContentSummary();
  }
}
