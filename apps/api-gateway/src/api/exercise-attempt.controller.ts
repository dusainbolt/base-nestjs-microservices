import {
  ApiHandleResponse,
  CONTENT_COMMANDS,
  CONTENT_SERVICE,
  CurrentUser,
  rpcToHttp,
} from '@app/common';
import {
  ExerciseAttemptResponseDto,
  ScorePackDto,
  StartPackResponseDto,
  SubmitExerciseAudioDto,
} from '@app/common/dto/content.dto';
import { JwtPayload } from '@app/common/dto/auth.dto';
import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Exercise Attempts')
@Controller()
export class ExerciseAttemptController {
  constructor(@Inject(CONTENT_SERVICE) private readonly contentClient: ClientProxy) {}

  // ─── Start Pack: tạo PackAttempt + N ExerciseAttempt (PENDING) ─────────────

  @Post('packs/:packId/start')
  @ApiHandleResponse({
    summary: 'Start a pack → creates PackAttempt + ExerciseAttempts',
    type: StartPackResponseDto,
  })
  startPack(@Param('packId') packId: string, @CurrentUser() user: JwtPayload) {
    // TODO: logic trừ credit sẽ thêm ở đây sau
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.START_PACK }, { packId, userId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── Tầng 1: Submit audio → Whisper STT → transcript ─────────────────────

  @Post('exercises/:exerciseId/transcript')
  @ApiHandleResponse({
    summary: 'Submit audio for an exercise → returns transcript from Whisper',
    type: ExerciseAttemptResponseDto,
  })
  submitTranscript(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: SubmitExerciseAudioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_AUDIO },
        {
          exerciseId,
          userId: user.sub,
          audioId: dto.audioId,
          durationMs: dto.durationMs,
        },
      )
      .pipe(rpcToHttp());
  }

  // ─── Tầng 2: AI Scoring toàn pack ────────────────────────────────────────

  @Post('packs/:packId/score')
  @ApiHandleResponse({
    summary: 'Request AI scoring for a completed pack (costs 5 credits)',
    type: Object,
  })
  scorePack(
    @Param('packId') packId: string,
    @Body() dto: ScorePackDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.SCORE_PACK },
        {
          packId,
          userId: user.sub,
          mode: dto.mode,
        },
      )
      .pipe(rpcToHttp());
  }
}
