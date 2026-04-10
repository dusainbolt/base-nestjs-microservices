/**
 * Seed dữ liệu practice cho 1 user — tạo PackAttempt + ExerciseAttempt
 * để endpoint GET /practice/stats trả về completionPercent > 0.
 *
 * Usage:
 *   npx ts-node apps/content-service/src/prisma/seed-practice-data.ts <userId>
 *
 * Ví dụ:
 *   npx ts-node apps/content-service/src/prisma/seed-practice-data.ts abc-123-user-id
 */

import { PrismaPg } from '@prisma/adapter-pg';
import {
  AttemptStatus,
  PackAttemptStatus,
  PackStatus,
  PrismaClient,
  ScoringMode,
  ScoringStatus,
} from '../generated/prisma/client';

require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Config ──────────────────────────────────────────────────────────────────

/** Số pack "đã hoàn thành" seed cho mỗi (categoryType × level) */
const PACKS_PER_GROUP = 2;

/** Score range cho các pack đã hoàn thành */
const SCORE_MIN = 60;
const SCORE_MAX = 95;

function randomScore(): number {
  return Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)) + SCORE_MIN;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Thiếu userId. Usage: npx ts-node seed-practice-data.ts <userId>');
    process.exit(1);
  }

  console.log(`\n🎯 Seed practice data cho userId: ${userId}`);
  console.log(`   Config: ${PACKS_PER_GROUP} packs/group, score ${SCORE_MIN}–${SCORE_MAX}\n`);

  // [1] Lấy tất cả packs PUBLISHED, group theo categoryType × levelId
  const packs = await prisma.lessonPack.findMany({
    where: { status: PackStatus.PUBLISHED },
    include: {
      category: { select: { type: true } },
      exercises: {
        orderBy: { sequenceOrder: 'asc' },
        select: { id: true, sequenceOrder: true },
      },
    },
    orderBy: [{ categoryId: 'asc' }, { levelId: 'asc' }],
  });

  // Group packs theo categoryType × levelId
  const grouped = new Map<string, typeof packs>();
  for (const pack of packs) {
    const key = `${pack.category.type}__${pack.levelId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(pack);
  }

  console.log(`📦 Tìm thấy ${packs.length} packs PUBLISHED, ${grouped.size} groups\n`);

  let totalPackAttempts = 0;
  let totalExerciseAttempts = 0;

  for (const [key, groupPacks] of grouped) {
    const [categoryType, levelIdStr] = key.split('__');
    const levelId = parseInt(levelIdStr, 10);

    // Lấy N packs đầu tiên trong group
    const selectedPacks = groupPacks.slice(0, PACKS_PER_GROUP);

    for (const pack of selectedPacks) {
      // Kiểm tra đã có PackAttempt passed chưa → skip nếu có
      const existing = await prisma.packAttempt.findFirst({
        where: { userId, lessonPackId: pack.id, passed: true },
      });

      if (existing) {
        console.log(`  ⏭️  Skip (đã có): ${pack.title}`);
        continue;
      }

      const overallScore = randomScore();
      const passThreshold = levelId === 1 ? 60 : levelId === 2 ? 65 : 70;
      const passed = overallScore >= passThreshold;

      // Tạo PackAttempt (SCORED + passed)
      const packAttempt = await prisma.packAttempt.create({
        data: {
          userId,
          lessonPackId: pack.id,
          status: PackAttemptStatus.SCORED,
          startedAt: randomPastDate(30),
          completedAt: randomPastDate(29),
          scoringStatus: ScoringStatus.COMPLETED,
          overallScore,
          passed,
          scoringMode: Math.random() > 0.5 ? ScoringMode.FREE : ScoringMode.GUIDED,
          scoredAt: randomPastDate(29),
        },
      });

      totalPackAttempts++;

      // Tạo ExerciseAttempt cho mỗi exercise (TRANSCRIBED)
      for (const exercise of pack.exercises) {
        await prisma.exerciseAttempt.create({
          data: {
            exerciseId: exercise.id,
            userId,
            packAttemptId: packAttempt.id,
            audioPath: `audio/${userId}/${exercise.id}.webm`,
            durationMs: randomInt(3000, 15000),
            transcript: generateFakeTranscript(exercise.sequenceOrder),
            status: AttemptStatus.TRANSCRIBED,
          },
        });

        totalExerciseAttempts++;
      }

      // Tạo ExerciseScore cho mỗi exercise
      for (const exercise of pack.exercises) {
        const criterion1 = randomScore();
        const grammar = randomScore();
        const vocab = randomScore();
        const exerciseScore = Math.round(criterion1 * 0.4 + grammar * 0.35 + vocab * 0.25);

        await prisma.exerciseScore.create({
          data: {
            packAttemptId: packAttempt.id,
            exerciseId: exercise.id,
            sequenceOrder: exercise.sequenceOrder,
            score: exerciseScore,
            criterion1Score: criterion1,
            criterion1Feedback: 'Bạn trả lời khá tốt, đúng chủ đề.',
            grammarScore: grammar,
            grammarFeedback:
              grammar >= 70 ? 'Ngữ pháp chính xác.' : 'Cần chú ý chia động từ cho đúng.',
            vocabScore: vocab,
            vocabFeedback:
              vocab >= 70 ? 'Từ vựng phong phú, phù hợp level.' : 'Nên mở rộng vốn từ hơn.',
          },
        });
      }

      const icon = passed ? '✅' : '⚠️';
      console.log(
        `  ${icon} ${categoryType} L${levelId} | ${pack.title} → ${overallScore}đ (${passed ? 'PASSED' : 'NOT PASSED'})`,
      );
    }
  }

  console.log(`\n🏁 Hoàn tất!`);
  console.log(`   PackAttempts: ${totalPackAttempts}`);
  console.log(`   ExerciseAttempts: ${totalExerciseAttempts}`);
  console.log(`   Groups seeded: ${grouped.size} (categoryType × level)\n`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomPastDate(maxDaysAgo: number): Date {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFakeTranscript(seq: number): string {
  const samples = [
    'I usually wake up at seven in the morning and have breakfast with my family.',
    'Yes, I work at a software company. I have been there for about two years now.',
    'I think the weather today is quite nice, maybe we can go for a walk later.',
    'My favorite hobby is reading books, especially about science and technology.',
    'I would like to order a coffee please, and also a piece of chocolate cake.',
  ];
  return samples[(seq - 1) % samples.length];
}

// ─── Run ─────────────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
