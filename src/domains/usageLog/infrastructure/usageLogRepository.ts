import prisma from '../../../shared/database/prismaClient';

import type { NewUsageLog } from '../domain/usageLogEntity';

export async function upsert(usageLog: NewUsageLog) {
  return prisma.usageLog.upsert({
    where: {
      userId_monitoredAppId_date: {
        userId: usageLog.userId,
        monitoredAppId: usageLog.monitoredAppId,
        date: usageLog.date
      }
    },
    update: {
      usedMinutes: usageLog.usedMinutes,
      entryCount: usageLog.entryCount
    },
    create: {
      userId: usageLog.userId,
      monitoredAppId: usageLog.monitoredAppId,
      date: usageLog.date,
      usedMinutes: usageLog.usedMinutes,
      entryCount: usageLog.entryCount
    }
  });
}
