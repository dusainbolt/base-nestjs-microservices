import { MEDIA_COMMANDS, MEDIA_SERVICE } from '@app/common';
import {
  ScorePackPayload,
  StartPackPayload,
  SubmitExerciseAudioPayload,
} from '@app/common/dto/content.dto';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
    // TODO: Inject AI_SERVICE khi ai-service được triển khai
    // @Inject(AI_SERVICE) private readonly aiClient: ClientProxy,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // START PACK: tạo PackAttempt + N ExerciseAttempt (PENDING)
  // ─────────────────────────────────────────────────────────────────────────────

  async startPackAttempt(payload: StartPackPayload) {
    const { packId, userId } = payload;

    // [1] Verify pack tồn tại + load exercises
    const pack = await this.prisma.lessonPack.findUnique({
      where: { id: packId },
      include: {
        exercises: { orderBy: { sequenceOrder: 'asc' } },
      },
    });

    if (!pack) {
      throw new NotFoundException(`Pack not found: id=${packId}`);
    }

    if (pack.exercises.length === 0) {
      throw new BadRequestException(`Pack has no exercises: id=${packId}`);
    }

    // [2] Kiểm tra nếu đã có PackAttempt IN_PROGRESS → trả lại (không tạo mới)
    const existing = await this.prisma.packAttempt.findFirst({
      where: { userId, lessonPackId: packId, status: 'IN_PROGRESS' },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          distinct: ['exerciseId'],
        },
      },
    });

    if (existing) {
      this.logger.log(`Returning existing PackAttempt: id=${existing.id}, pack=${packId}`);
      return {
        packAttemptId: existing.id,
        exercises: existing.attempts.map((a) => ({
          exerciseAttemptId: a.id,
          exerciseId: a.exerciseId,
          sequenceOrder: pack.exercises.find((e) => e.id === a.exerciseId)?.sequenceOrder ?? 0,
        })),
      };
    }

    // [3] Tạo PackAttempt + N ExerciseAttempt trong transaction
    // TODO: logic trừ credit sẽ nằm ở đây sau
    const packAttempt = await this.prisma.$transaction(async (tx) => {
      const pa = await tx.packAttempt.create({
        data: {
          userId,
          lessonPackId: packId,
          status: 'IN_PROGRESS',
        },
      });

      const exerciseAttempts = await Promise.all(
        pack.exercises.map((ex) =>
          tx.exerciseAttempt.create({
            data: {
              exerciseId: ex.id,
              userId,
              packAttemptId: pa.id,
              status: 'PENDING',
            },
          }),
        ),
      );

      return { packAttempt: pa, exerciseAttempts };
    });

    this.logger.log(
      `Created PackAttempt: id=${packAttempt.packAttempt.id}, pack=${packId}, exercises=${packAttempt.exerciseAttempts.length}`,
    );

    return {
      packAttemptId: packAttempt.packAttempt.id,
      exercises: packAttempt.exerciseAttempts.map((a) => ({
        exerciseAttemptId: a.id,
        exerciseId: a.exerciseId,
        sequenceOrder: pack.exercises.find((e) => e.id === a.exerciseId)?.sequenceOrder ?? 0,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TẦNG 1: Submit Audio → find attempt by ID → update audioPath → Whisper
  // ─────────────────────────────────────────────────────────────────────────────

  async submitExerciseAudio(payload: SubmitExerciseAudioPayload) {
    const { exerciseAttemptId, userId, audioId, durationMs } = payload;

    // [1] Tìm ExerciseAttempt theo ID (đã tạo từ startPack)
    const attempt = await this.prisma.exerciseAttempt.findUnique({
      where: { id: exerciseAttemptId },
    });
    console.debug('attempt', attempt);
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException(`ExerciseAttempt not found: id=${exerciseAttemptId}`);
    }

    // [2] Resolve audioId → audioPath qua media-service
    const media = await firstValueFrom(
      this.mediaClient.send({ cmd: MEDIA_COMMANDS.GET_BY_ID }, { id: audioId }).pipe(
        timeout(5000),
        catchError((err) => {
          this.logger.error(`Failed to resolve audioId=${audioId}: ${err.message}`);
          throw new NotFoundException(`Audio not found: audioId=${audioId}`);
        }),
      ),
    );

    const audioPath: string = media.path; // S3 key

    // [3] Update ExerciseAttempt với audioPath + durationMs
    await this.prisma.exerciseAttempt.update({
      where: { id: exerciseAttemptId },
      data: {
        audioPath,
        durationMs: durationMs ?? null,
      },
    });

    this.logger.log(`Updated ExerciseAttempt: id=${exerciseAttemptId}, audioPath=${audioPath}`);

    // [4] Gọi ai-service transcribe (Whisper STT)
    // TODO: Bật khi ai-service sẵn sàng

    // --- STUB: trả về attempt (chờ ai-service) ---
    return {
      exerciseAttemptId,
      transcript: null,
      status: 'PENDING',
      audioPath,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TẦNG 2: AI Scoring — toàn pack
  // ─────────────────────────────────────────────────────────────────────────────

  async scorePackAttempt(payload: ScorePackPayload) {
    const { packAttemptId, userId, mode } = payload;

    // [1] Tìm PackAttempt
    const packAttempt = await this.prisma.packAttempt.findFirst({
      where: {
        id: packAttemptId,
        userId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] },
      },
    });

    if (!packAttempt) {
      throw new NotFoundException(`PackAttempt not found: id=${packAttemptId}`);
    }

    // [2] Load pack + exercises
    const pack = await this.prisma.lessonPack.findUnique({
      where: { id: packAttempt.lessonPackId },
      include: {
        exercises: { orderBy: { sequenceOrder: 'asc' } },
      },
    });

    if (!pack) {
      throw new NotFoundException(`Pack not found for attempt: id=${packAttempt.lessonPackId}`);
    }

    // [3] Load transcripts (lấy attempt mới nhất của mỗi exercise)
    const attempts = await this.prisma.exerciseAttempt.findMany({
      where: {
        packAttemptId: packAttempt.id,
        status: 'TRANSCRIBED',
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['exerciseId'],
    });

    // [4] Build payload cho ai-service
    const exercisesForAI = pack.exercises.map((ex) => {
      const attempt = attempts.find((a) => a.exerciseId === ex.id);
      return {
        seq: ex.sequenceOrder,
        prompt: ex.previousPrompt ?? '',
        ...(mode === 'GUIDED' && {
          instruction: ex.myPrompt,
        }),
        transcript: attempt?.transcript ?? '',
      };
    });

    // [5] Update status → SCORING
    await this.prisma.packAttempt.update({
      where: { id: packAttempt.id },
      data: { scoringStatus: 'PROCESSING', scoringMode: mode },
    });

    // [6] Gọi ai-service scoring
    // TODO: Bật khi ai-service sẵn sàng

    // --- STUB ---
    this.logger.log(
      `Score pack requested: packAttempt=${packAttempt.id}, mode=${mode}, exercises=${exercisesForAI.length}`,
    );

    return {
      packAttemptId: packAttempt.id,
      status: 'PROCESSING',
      mode,
      exerciseCount: exercisesForAI.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET: Kết quả scoring của một PackAttempt cụ thể
  // ─────────────────────────────────────────────────────────────────────────────

  async getScoringByAttemptId(packAttemptId: string, userId: string) {
    const packAttempt = await this.prisma.packAttempt.findUnique({
      where: {
        id: packAttemptId,
      },
      include: {
        exerciseScores: {
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!packAttempt || packAttempt.userId !== userId) {
      throw new NotFoundException(`PackAttempt not found: id=${packAttemptId}`);
    }

    if (packAttempt.scoringStatus !== 'COMPLETED') {
      throw new BadRequestException(`Scoring is not completed for attempt: id=${packAttemptId}`);
    }

    return {
      packAttemptId: packAttempt.id,
      overallScore: packAttempt.overallScore,
      passed: packAttempt.passed,
      scoringMode: packAttempt.scoringMode,
      scoredAt: packAttempt.scoredAt,
      exercises: packAttempt.exerciseScores.map((es) => ({
        exerciseId: es.exerciseId,
        seq: es.sequenceOrder,
        score: es.score,
        criterion1: {
          score: es.criterion1Score,
          feedback: es.criterion1Feedback,
        },
        grammar: {
          score: es.grammarScore,
          feedback: es.grammarFeedback,
        },
        vocabulary: {
          score: es.vocabScore,
          feedback: es.vocabFeedback,
        },
        tasks: es.tasks,
        suggestedPhrases: es.suggestedPhrases,
      })),
    };
  }
}
