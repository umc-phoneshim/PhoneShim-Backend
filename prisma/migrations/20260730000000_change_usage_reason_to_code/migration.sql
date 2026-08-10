-- CreateEnum
CREATE TYPE "UsageReasonCode" AS ENUM ('LEISURE', 'COMMUTE', 'HABIT', 'INFO', 'OTHER');

TRUNCATE TABLE "usage_reasons";

-- AlterTable
ALTER TABLE "usage_reasons" DROP COLUMN "reason",
ADD COLUMN     "reason" "UsageReasonCode" NOT NULL;
