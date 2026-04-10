import {
  ApiHandleResponse,
  CONTENT_COMMANDS,
  CONTENT_SERVICE,
  CurrentUser,
  rpcToHttp,
} from '@app/common';
import { JwtPayload } from '@app/common/dto/auth.dto';
import {
  PackScoringResponseDto,
  ScorePackDto,
  ScorePackResponseDto,
  StartPackResponseDto,
  SubmitExerciseAudioDto,
  SubmitExerciseAudioResponseDto,
} from '@app/common/dto/content.dto';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Practice')
@Controller('practice')
export class PracticeController {
  constructor(@Inject(CONTENT_SERVICE) private readonly contentClient: ClientProxy) {}

  // ─── Start Pack: tạo PackAttempt + N ExerciseAttempt (PENDING) ─────────────

  @Post('packs/:packId/start')
  @ApiHandleResponse({
    summary: 'Start a pack → creates PackAttempt + ExerciseAttempts',
    type: StartPackResponseDto,
  })
  startPackAttempt(@Param('packId') packId: string, @CurrentUser() user: JwtPayload) {
    // TODO: logic trừ credit sẽ thêm ở đây sau
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.START_PACK_ATTEMPT }, { packId, userId: user.sub })
      .pipe(rpcToHttp());
  }

  // ─── Tầng 1: Submit audio → Whisper STT → transcript ─────────────────────

  @Post('exercise-attempts/:exerciseAttemptId/transcript')
  @ApiHandleResponse({
    summary: 'Submit audio for an exercise attempt → returns transcript from Whisper',
    type: SubmitExerciseAudioResponseDto,
  })
  submitTranscript(
    @Param('exerciseAttemptId') exerciseAttemptId: string,
    @Body() dto: SubmitExerciseAudioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_ATTEMPT_AUDIO },
        {
          exerciseAttemptId,
          userId: user.sub,
          audioId: dto.audioId,
          durationMs: dto.durationMs,
        },
      )
      .pipe(rpcToHttp());
  }

  // ─── Tầng 2: AI Scoring toàn pack ────────────────────────────────────────

  @Post('pack-attempts/:packAttemptId/score')
  @ApiHandleResponse({
    summary: 'Request AI scoring for a completed pack attempt (costs 5 credits)',
    type: ScorePackResponseDto,
  })
  scorePackAttempt(
    @Param('packAttemptId') packAttemptId: string,
    @Body() dto: ScorePackDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.SCORE_PACK_ATTEMPT },
        { packAttemptId, userId: user.sub, mode: dto.mode },
      )
      .pipe(rpcToHttp());
  }

  @Get('pack-attempts/:packAttemptId/score')
  @ApiHandleResponse({
    summary: 'Get scoring results for a specific pack attempt',
    type: PackScoringResponseDto,
  })
  getScoring(@Param('packAttemptId') packAttemptId: string, @CurrentUser() user: JwtPayload) {
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.GET_PACK_SCORING }, { packAttemptId, userId: user.sub })
      .pipe(rpcToHttp());
  }
}
