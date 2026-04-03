-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_profiles_deletedAt_idx" ON "user_profiles"("deletedAt");
