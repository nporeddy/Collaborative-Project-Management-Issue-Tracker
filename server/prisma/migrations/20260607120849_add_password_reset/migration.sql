-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX "VerificationToken_userId_idx";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "type" "VerificationTokenType" NOT NULL DEFAULT 'EMAIL_VERIFICATION';

-- CreateIndex
CREATE INDEX "VerificationToken_userId_type_idx" ON "VerificationToken"("userId", "type");
