import { CONTENT_COMMANDS, RmqInterceptor } from '@app/common';
import {
  StartPackPayload,
  SubmitExerciseAudioPayload,
  ScorePackPayload,
} from '@app/common/dto/content.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExerciseAttemptService } from './exercise-attempt.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class ExerciseAttemptController {
  constructor(private readonly exerciseAttemptService: ExerciseAttemptService) {}

  // ── Start Pack: tạo PackAttempt + N ExerciseAttempt (PENDING) ─────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.START_PACK })
  startPack(@Payload() payload: StartPackPayload) {
    return this.exerciseAttemptService.startPack(payload);
  }

  // ── Tầng 1: Submit audio → update audioPath → Whisper → transcript ────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_AUDIO })
  submitExerciseAudio(@Payload() payload: SubmitExerciseAudioPayload) {
    return this.exerciseAttemptService.submitAudio(payload);
  }

  // ── Tầng 2: AI Scoring toàn pack ──────────────────────────────────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.SCORE_PACK })
  scorePack(@Payload() payload: ScorePackPayload) {
    return this.exerciseAttemptService.scorePack(payload);
  }

  // ── Lấy kết quả scoring đã lưu ────────────────────────────────────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACK_SCORING })
  getPackScoring(@Payload() payload: { packId: string; userId: string }) {
    return this.exerciseAttemptService.getPackScoring(payload.packId, payload.userId);
  }
}
