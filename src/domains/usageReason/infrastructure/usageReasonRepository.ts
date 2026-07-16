import prisma from '../../../shared/database/prismaClient';

import type { NewUsageReason } from '../domain/usageReasonEntity';

export async function save(usageReason: NewUsageReason) {
  return prisma.usageReason.create({
    data: {
      userId: usageReason.userId,
      monitoredAppId: usageReason.monitoredAppId,
      usageLogId: usageReason.usageLogId,
      date: usageReason.date,
      timeRangeStart: usageReason.timeRangeStart,
      timeRangeEnd: usageReason.timeRangeEnd,
      reason: usageReason.reason
    }
  });
}
