/*
  Warnings:

  - You are about to drop the column `attemptSeq` on the `exercise_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `exercise_attempts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exercise_attempts" DROP COLUMN "attemptSeq",
DROP COLUMN "audioUrl",
ADD COLUMN     "audioPath" TEXT;
