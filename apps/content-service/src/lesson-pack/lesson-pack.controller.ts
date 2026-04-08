import {
  CONTENT_COMMANDS,
  GetPackByIdDto,
  GetPacksByIdsDto,
  GetPacksDto,
  GetPackStatsByCategoryAndLevelDto,
  GetPackExercisesDto,
  RmqInterceptor,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LessonPackService } from './lesson-pack.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class LessonPackController {
  constructor(private readonly lessonPackService: LessonPackService) {}

  // ── 3.1 GET /packs (list với filter) ────────────────────────────────────────
  // Dùng cho màn hình "Xem tất cả" — filter by categoryId, levelId, categoryType
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACKS })
  getPacks(@Payload() payload: GetPacksDto) {
    return this.lessonPackService.getPacks(payload);
  }

  // ── 3.2 GET /packs/:id ──────────────────────────────────────────────────────
  // Chi tiết 1 pack khi user bấm vào play
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACK_BY_ID })
  getPackById(@Payload() payload: GetPackByIdDto) {
    return this.lessonPackService.getPackById(payload);
  }

  // ── 3.3 GET /packs/batch (batch fetch by IDs) ────────────────────────────────
  // Dùng cho Section 4 (recent packs): sau khi user-service trả về packIds,
  // content-service trả về pack info tương ứng.
  // Thứ tự items trong response giữ nguyên thứ tự ids truyền vào.
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACKS_BY_IDS })
  getPacksByIds(@Payload() payload: GetPacksByIdsDto) {
    return this.lessonPackService.getPacksByIds(payload);
  }

  // ── 3.4 GET /packs/stats (mẫu số cho Section 3 overview) ────────────────────
  // Đếm tổng packs + exercises trong một category × level.
  // Dùng để tính: completedPacks/totalPacks, completedExercises/totalExercises
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACK_STATS_BY_CATEGORY_AND_LEVEL })
  getPackStatsByCategoryAndLevel(
    @Payload() payload: GetPackStatsByCategoryAndLevelDto,
  ) {
    return this.lessonPackService.getPackStatsByCategoryAndLevel(payload);
  }

  // ── 3.5 GET /packs/:id/exercises ────────────────────────────────────────────
  // Lấy tất cả exercises trong pack khi user bắt đầu làm bài
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACK_EXERCISES })
  getPackExercises(@Payload() payload: GetPackExercisesDto) {
    return this.lessonPackService.getPackExercises(payload);
  }
}
