/*
  Warnings:

  - The `referType` column on the `media` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "media" DROP COLUMN "referType",
ADD COLUMN     "referType" TEXT;

-- DropEnum
DROP TYPE "ReferType";
