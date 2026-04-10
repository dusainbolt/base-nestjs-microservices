import { CONTENT_COMMANDS, RmqInterceptor } from '@app/common';
import {
  ScorePackPayload,
  StartPackPayload,
  SubmitExerciseAudioPayload,
} from '@app/common/dto/content.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PracticeService } from './practice.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  // ── Start Pack: tạo PackAttempt + N ExerciseAttempt (PENDING) ─────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.START_PACK_ATTEMPT })
  startPackAttempt(@Payload() payload: StartPackPayload) {
    return this.practiceService.startPackAttempt(payload);
  }

  // ── Tầng 1: Submit audio → update audioPath → Whisper → transcript ────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_AUDIO })
  submitExerciseAudio(@Payload() payload: SubmitExerciseAudioPayload) {
    return this.practiceService.submitExerciseAudio(payload);
  }

  // ── Tầng 2: AI Scoring toàn pack ──────────────────────────────────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.SCORE_PACK_ATTEMPT })
  scorePackAttempt(@Payload() payload: ScorePackPayload) {
    return this.practiceService.scorePackAttempt(payload);
  }

  // ── Lấy kết quả scoring đã lưu ────────────────────────────────────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACK_SCORING })
  getPackScoring(@Payload() payload: { packAttemptId: string; userId: string }) {
    return this.practiceService.getScoringByAttemptId(payload.packAttemptId, payload.userId);
  }
}
