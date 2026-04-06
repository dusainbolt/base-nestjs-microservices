-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'USED', 'UNUSED');

-- CreateEnum
CREATE TYPE "ReferType" AS ENUM ('USER_AVATAR', 'POST_THUMBNAIL', 'PRODUCT_IMAGE', 'TEMP');

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PENDING',
    "referType" "ReferType",
    "referId" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_path_key" ON "media"("path");

-- CreateIndex
CREATE INDEX "media_path_idx" ON "media"("path");

-- CreateIndex
CREATE INDEX "media_status_idx" ON "media"("status");

-- CreateIndex
CREATE INDEX "media_uploadedByUserId_idx" ON "media"("uploadedByUserId");
