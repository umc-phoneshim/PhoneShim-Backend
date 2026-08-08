import prisma from '../../../shared/database/prismaClient';

import type { NewUsageReason } from '../domain/usageReasonEntity';

// 고른 사유마다 행을 하나씩 생성/ 하나라도 실패하면 전부 롤백
export async function saveMany(usageReasons: NewUsageReason[]) {
  return prisma.$transaction(
    usageReasons.map((usageReason) =>
      prisma.usageReason.create({
        data: {
          userId: usageReason.userId,
          monitoredAppId: usageReason.monitoredAppId,
          usageLogId: usageReason.usageLogId,
          date: usageReason.date,
          timeRangeStart: usageReason.timeRangeStart,
          timeRangeEnd: usageReason.timeRangeEnd,
          reason: usageReason.reason
        }
      })
    )
  );
}
