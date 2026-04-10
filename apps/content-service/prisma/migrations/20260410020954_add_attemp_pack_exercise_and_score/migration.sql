-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'TRANSCRIBED', 'TRANSCRIPT_FAILED');

-- CreateEnum
CREATE TYPE "PackAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'SCORING', 'SCORED');

-- CreateEnum
CREATE TYPE "ScoringStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ScoringMode" AS ENUM ('FREE', 'GUIDED');

-- CreateTable
CREATE TABLE "exercise_attempts" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packAttemptId" TEXT,
    "attemptSeq" INTEGER NOT NULL DEFAULT 1,
    "audioUrl" TEXT,
    "durationMs" INTEGER,
    "transcript" TEXT,
    "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonPackId" TEXT NOT NULL,
    "status" "PackAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "scoringStatus" "ScoringStatus",
    "overallScore" INTEGER,
    "passed" BOOLEAN,
    "scoringMode" "ScoringMode",
    "scoredAt" TIMESTAMP(3),
    "aiResponseRaw" JSONB,

    CONSTRAINT "pack_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_scores" (
    "id" TEXT NOT NULL,
    "packAttemptId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "criterion1Score" INTEGER NOT NULL,
    "criterion1Feedback" TEXT,
    "grammarScore" INTEGER NOT NULL,
    "grammarFeedback" TEXT,
    "vocabScore" INTEGER NOT NULL,
    "vocabFeedback" TEXT,
    "tasks" JSONB,
    "suggestedPhrases" JSONB,

    CONSTRAINT "exercise_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercise_attempts_userId_exerciseId_idx" ON "exercise_attempts"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "exercise_attempts_packAttemptId_idx" ON "exercise_attempts"("packAttemptId");

-- CreateIndex
CREATE INDEX "pack_attempts_userId_lessonPackId_idx" ON "pack_attempts"("userId", "lessonPackId");

-- CreateIndex
CREATE INDEX "exercise_scores_packAttemptId_idx" ON "exercise_scores"("packAttemptId");

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_packAttemptId_fkey" FOREIGN KEY ("packAttemptId") REFERENCES "pack_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_attempts" ADD CONSTRAINT "pack_attempts_lessonPackId_fkey" FOREIGN KEY ("lessonPackId") REFERENCES "lesson_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_scores" ADD CONSTRAINT "exercise_scores_packAttemptId_fkey" FOREIGN KEY ("packAttemptId") REFERENCES "pack_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
