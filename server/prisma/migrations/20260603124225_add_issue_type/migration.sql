-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('STORY', 'BUG', 'TASK');

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "type" "IssueType" NOT NULL DEFAULT 'TASK';
