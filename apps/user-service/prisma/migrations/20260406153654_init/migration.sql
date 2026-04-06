/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `user_profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_profiles_deletedAt_idx";

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "deletedAt";
