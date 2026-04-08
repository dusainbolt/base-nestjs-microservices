import {
  CONTENT_COMMANDS,
  GetLevelByIdDto,
  GetTotalExercisesPerLevelDto,
  RmqInterceptor,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LevelService } from './level.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  // ── 2.1 GET all levels ───────────────────────────────────────────────────────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_LEVELS })
  getLevels() {
    return this.levelService.getLevels();
  }

  // ── 2.2 GET level by ID ──────────────────────────────────────────────────────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_LEVEL_BY_ID })
  getLevelById(@Payload() payload: GetLevelByIdDto) {
    return this.levelService.getLevelById(payload);
  }

  // ── 2.3 GET total exercises per level × category type (FR-B04 mẫu số) ───────
  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_TOTAL_EXERCISES_PER_LEVEL })
  getTotalExercisesPerLevel(@Payload() payload: GetTotalExercisesPerLevelDto) {
    return this.levelService.getTotalExercisesPerLevel(payload);
  }
}
