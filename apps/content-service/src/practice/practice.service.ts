import { AI_COMMANDS, AI_SERVICE, isAudioFile, MEDIA_COMMANDS, MEDIA_SERVICE } from '@app/common';
import {
  CategoryType,
  PackScoringResponseDto,
  ScorePackPayload,
  ScorePackResponseDto,
  ScoringMode,
  ScoringStatus,
  StartPackPayload,
  StartPackResponseDto,
  SubmitExerciseAudioPayload,
  SubmitExerciseAudioResponseDto,
} from '@app/common/dto/content.dto';
import { ReferType } from '@app/common/dto/media.dto';
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, lastValueFrom, timeout } from 'rxjs';
import { AttemptStatus, PackAttemptStatus, PackStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
    @Inject(AI_SERVICE) private readonly aiClient: ClientProxy,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // START PACK: tạo PackAttempt + N ExerciseAttempt (PENDING)
  // ─────────────────────────────────────────────────────────────────────────────

  async startPackAttempt(payload: StartPackPayload): Promise<StartPackResponseDto> {
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
      where: { userId, lessonPackId: packId, status: PackAttemptStatus.IN_PROGRESS },
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
        isNew: false,
        packAttemptId: existing.id,
        exercises: existing.attempts.map((a) => ({
          exerciseAttemptId: a.id,
          exerciseId: a.exerciseId,
          sequenceOrder: pack.exercises.find((e) => e.id === a.exerciseId)?.sequenceOrder ?? 0,
          status: a.status as any,
          audioPath: a.audioPath ?? undefined,
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
          status: PackAttemptStatus.IN_PROGRESS,
        },
      });

      const exerciseAttempts = await Promise.all(
        pack.exercises.map((ex) =>
          tx.exerciseAttempt.create({
            data: {
              exerciseId: ex.id,
              userId,
              packAttemptId: pa.id,
              status: AttemptStatus.PENDING,
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
      isNew: true,
      packAttemptId: packAttempt.packAttempt.id,
      exercises: packAttempt.exerciseAttempts.map((a) => ({
        exerciseAttemptId: a.id,
        exerciseId: a.exerciseId,
        sequenceOrder: pack.exercises.find((e) => e.id === a.exerciseId)?.sequenceOrder ?? 0,
        status: a.status as any,
        audioPath: a.audioPath ?? undefined,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TẦNG 1: Submit Audio → find attempt by ID → update audioPath → Whisper
  // ─────────────────────────────────────────────────────────────────────────────

  async submitExerciseAttemptAudio(
    payload: SubmitExerciseAudioPayload,
  ): Promise<SubmitExerciseAudioResponseDto> {
    const { exerciseAttemptId, userId, audioId, durationMs } = payload;

    // [1] Tìm ExerciseAttempt theo ID (đã tạo từ startPack)
    const attempt = await this.prisma.exerciseAttempt.findUnique({
      where: { id: exerciseAttemptId },
    });
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

    // [2.1] Idempotency: Nếu đã transcribe xong VÀ dùng đúng audio này -> Trả về luôn
    if (attempt.status === AttemptStatus.TRANSCRIBED) {
      this.logger.log(
        `Idempotency trigger: Attempt ${exerciseAttemptId} already transcribed with same audio. Skipping Whisper.`,
      );
      return {
        exerciseAttemptId,
        transcript: attempt.transcript ?? '',
        audioPath: attempt.audioPath ?? '',
      };
    }

    // [2.5] Validate file extension
    if (!isAudioFile(audioPath)) {
      throw new BadRequestException(`File is not a valid audio format: ${audioPath}`);
    }

    // [3] Update ExerciseAttempt với audioPath + durationMs + status
    await this.prisma.exerciseAttempt.update({
      where: { id: exerciseAttemptId },
      data: {
        audioPath,
        durationMs: durationMs ?? null,
      },
    });

    this.logger.log(`Updated ExerciseAttempt: id=${exerciseAttemptId}, audioPath=${audioPath}`);

    // [3.5] Mark media as USED
    try {
      await lastValueFrom(
        this.mediaClient.send(
          { cmd: MEDIA_COMMANDS.MARK_USED },
          {
            id: audioId,
            referType: ReferType.EXERCISE_AUDIO,
            referId: exerciseAttemptId,
          },
        ),
      );
    } catch (err) {
      // Không throw lỗi ở đây để tránh làm gián đoạn luồng chính (Whisper)
    }

    // [4] Gọi ai-service transcribe (Whisper STT)
    try {
      const { transcript } = await firstValueFrom(
        this.aiClient
          .send({ cmd: AI_COMMANDS.TRANSCRIBE_AUDIO }, { audioPath })
          .pipe(timeout(30000)), // Whisper transcription can take ~10-30s depending on audio length
      );

      await this.prisma.exerciseAttempt.update({
        where: { id: exerciseAttemptId },
        data: { transcript, status: AttemptStatus.TRANSCRIBED },
      });

      return {
        exerciseAttemptId,
        transcript,
        audioPath,
      };
    } catch (error) {
      await this.prisma.exerciseAttempt.update({
        where: { id: exerciseAttemptId },
        data: { status: AttemptStatus.TRANSCRIPT_FAILED },
      });
      this.logger.error(`Transcription failed for attempt ${exerciseAttemptId}: ${error}`);
      throw new BadGatewayException('Whisper transcription failed');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TẦNG 2: AI Scoring — toàn pack
  // ─────────────────────────────────────────────────────────────────────────────

  async scorePackAttempt(payload: ScorePackPayload): Promise<ScorePackResponseDto> {
    const { packAttemptId, userId, mode } = payload;

    // [1] Tìm PackAttempt
    const packAttempt = await this.prisma.packAttempt.findFirst({
      where: {
        id: packAttemptId,
        userId,
        status: { in: [PackAttemptStatus.COMPLETED, PackAttemptStatus.IN_PROGRESS] },
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
        status: AttemptStatus.TRANSCRIBED,
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
      data: { scoringStatus: ScoringStatus.PROCESSING, scoringMode: mode },
    });

    // [6] Gọi ai-service scoring
    this.logger.log(
      `Score pack requested: packAttempt=${packAttempt.id}, mode=${mode}, exercises=${exercisesForAI.length}`,
    );

    // Send the task to AI Service. Note: Scoring can take ~30-60s for a full pack.
    // We send without waiting for a direct sync response, using an event or long-polling pattern later,
    // OR we wait for it if the FE needs it directly (adjust timeout).
    // For now, let's trigger it asynchronously and return PROCESSING status.
    this.aiClient
      .emit(AI_COMMANDS.SCORE_PACK_ATTEMPT, {
        packAttemptId: packAttempt.id,
        exercises: exercisesForAI,
        mode,
      })
      .subscribe({
        error: (err) => this.logger.error(`Failed to trigger AI scoring: ${err}`),
      });

    return {
      packAttemptId: packAttempt.id,
      status: ScoringStatus.PROCESSING,
      mode: mode as ScoringMode,
      exerciseCount: exercisesForAI.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET: Kết quả scoring của một PackAttempt cụ thể
  // ─────────────────────────────────────────────────────────────────────────────

  async getScoringByAttemptId(
    packAttemptId: string,
    userId: string,
  ): Promise<PackScoringResponseDto> {
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

    if (packAttempt.scoringStatus !== ScoringStatus.COMPLETED) {
      throw new BadRequestException(`Scoring is not completed for attempt: id=${packAttemptId}`);
    }

    return {
      packAttemptId: packAttempt.id,
      overallScore: packAttempt.overallScore ?? 0,
      passed: packAttempt.passed ?? false,
      scoringMode: packAttempt.scoringMode as ScoringMode,
      scoredAt: packAttempt.scoredAt ?? new Date(),
      exercises: packAttempt.exerciseScores.map((es) => ({
        exerciseId: es.exerciseId,
        seq: es.sequenceOrder,
        score: es.score,
        criterion1: {
          score: es.criterion1Score,
          feedback: es.criterion1Feedback ?? '',
        },
        grammar: {
          score: es.grammarScore,
          feedback: es.grammarFeedback ?? '',
        },
        vocabulary: {
          score: es.vocabScore,
          feedback: es.vocabFeedback ?? '',
        },
        tasks: es.tasks,
        suggestedPhrases: (es.suggestedPhrases as string[]) ?? [],
      })),
    };
  }

  // ─── GET USER STATISTICS (1 QUERY) ──────────────────────────────────────────

  async getUserPracticeStats(userId: string) {
    // 1 Query để lấy toàn bộ thống kê tổng số bài học và số lượng đã hoàn thành (theo user)
    // GROUP BY c.type, p."levelId"
    const rawStats: any[] = await this.prisma.$queryRaw`
      SELECT 
        CAST(c.type AS text) as "categoryType",
        p."levelId" as "levelId",
        COUNT(DISTINCT p.id)::int as "totalPacks",
        COUNT(DISTINCT CASE WHEN pa.id IS NOT NULL THEN p.id END)::int as "completedPacks"
      FROM lesson_packs p
      JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN pack_attempts pa 
        ON pa."lessonPackId" = p.id 
        AND pa."userId" = ${userId} 
        AND pa.passed = true
      WHERE CAST(p.status AS text) = ${PackStatus.PUBLISHED}
      GROUP BY c.type, p."levelId"
    `;

    const categoryMap = new Map<string, { type: CategoryType; total: number; completed: number }>();

    // Khởi tạo các category mặc định để đảm bảo luôn trả về đủ 3 loại
    categoryMap.set(CategoryType.EVERYDAY, {
      type: CategoryType.EVERYDAY,
      total: 0,
      completed: 0,
    });
    categoryMap.set(CategoryType.OFFICE, {
      type: CategoryType.OFFICE,
      total: 0,
      completed: 0,
    });
    categoryMap.set(CategoryType.NICHE, {
      type: CategoryType.NICHE,
      total: 0,
      completed: 0,
    });

    const levels: {
      id: number;
      categoryType: string;
      totalPacks: number;
      passedPacks: number;
      completionPercent: number;
    }[] = [];

    for (const row of rawStats) {
      const type = row.categoryType as string;
      const totalPacks = row.totalPacks || 0;
      const passedPacks = row.completedPacks || 0;

      const cat = categoryMap.get(type);
      if (cat) {
        cat.total += totalPacks;
        cat.completed += passedPacks;
      }

      levels.push({
        id: row.levelId,
        categoryType: type,
        totalPacks,
        passedPacks,
        completionPercent: totalPacks > 0 ? Math.round((passedPacks / totalPacks) * 100) : 0,
      });
    }

    const categories = Array.from(categoryMap.values()).map((cat) => ({
      type: cat.type,
      totalPacks: cat.total,
      passedPacks: cat.completed,
      completionPercent: cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0,
    }));

    return { categories, levels };
  }
}
