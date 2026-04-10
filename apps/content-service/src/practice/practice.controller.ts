import { CONTENT_COMMANDS, RmqInterceptor } from '@app/common';
import {
  PackScoringResponseDto,
  ScorePackPayload,
  ScorePackResponseDto,
  StartPackPayload,
  StartPackResponseDto,
  SubmitExerciseAudioPayload,
  SubmitExerciseAudioResponseDto,
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
  startPackAttempt(@Payload() payload: StartPackPayload): Promise<StartPackResponseDto> {
    return this.practiceService.startPackAttempt(payload);
  }

  // ── Tầng 1: Submit audio → update audioPath → Whisper → transcript ────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_ATTEMPT_AUDIO })
  submitExerciseAttemptAudio(
    @Payload() payload: SubmitExerciseAudioPayload,
  ): Promise<SubmitExerciseAudioResponseDto> {
    return this.practiceService.submitExerciseAttemptAudio(payload);
  }

  // ── Tầng 2: AI Scoring toàn pack ──────────────────────────────────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.SCORE_PACK_ATTEMPT })
  scorePackAttempt(@Payload() payload: ScorePackPayload): Promise<ScorePackResponseDto> {
    return this.practiceService.scorePackAttempt(payload);
  }

  // ── Lấy kết quả scoring đã lưu ────────────────────────────────────────────

  @MessagePattern({ cmd: CONTENT_COMMANDS.GET_PACK_SCORING })
  getPackScoring(
    @Payload() payload: { packAttemptId: string; userId: string },
  ): Promise<PackScoringResponseDto> {
    return this.practiceService.getScoringByAttemptId(payload.packAttemptId, payload.userId);
  }
}
