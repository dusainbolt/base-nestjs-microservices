-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('EVERYDAY', 'OFFICE', 'NICHE');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "subCategory" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" INTEGER NOT NULL,
    "description" TEXT,
    "passThresholdScore" INTEGER NOT NULL,
    "outputRequirements" JSONB NOT NULL,
    "examples" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_packs" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "status" "PackStatus" NOT NULL DEFAULT 'DRAFT',
    "totalPlays" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "lessonPackId" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "previousPrompt" TEXT,
    "myPrompt" TEXT NOT NULL,
    "levelHint" TEXT,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_type_subCategory_key" ON "categories"("name", "type", "subCategory");

-- CreateIndex
CREATE INDEX "topics_categoryId_idx" ON "topics"("categoryId");

-- CreateIndex
CREATE INDEX "topics_levelId_idx" ON "topics"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "topics_categoryId_levelId_key" ON "topics"("categoryId", "levelId");

-- CreateIndex
CREATE INDEX "lesson_packs_creatorId_idx" ON "lesson_packs"("creatorId");

-- CreateIndex
CREATE INDEX "lesson_packs_categoryId_levelId_status_idx" ON "lesson_packs"("categoryId", "levelId", "status");

-- CreateIndex
CREATE INDEX "lesson_packs_topicId_status_idx" ON "lesson_packs"("topicId", "status");

-- CreateIndex
CREATE INDEX "exercises_lessonPackId_idx" ON "exercises"("lessonPackId");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_lessonPackId_sequenceOrder_key" ON "exercises"("lessonPackId", "sequenceOrder");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_packs" ADD CONSTRAINT "lesson_packs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_packs" ADD CONSTRAINT "lesson_packs_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_packs" ADD CONSTRAINT "lesson_packs_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lessonPackId_fkey" FOREIGN KEY ("lessonPackId") REFERENCES "lesson_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
