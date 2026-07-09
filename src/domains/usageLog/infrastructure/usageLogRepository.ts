import prisma from '../../../shared/database/prismaClient';

import type { DailyUsageSummary } from '../domain/usageLogRepositoryInterface';
import type { NewUsageLog } from '../domain/usageLogEntity';

export async function upsertDaily(usageLog: NewUsageLog) {
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
    create: usageLog
  });
}

export async function findAllByUserIdAndDate(
  userId: string,
  monitoredAppIds: string[],
  date: Date
): Promise<DailyUsageSummary[]> {
  if (monitoredAppIds.length === 0) {
    return [];
  }

  const usageLogs = await prisma.usageLog.findMany({
    where: {
      userId,
      monitoredAppId: { in: monitoredAppIds },
      date
    }
  });

  return usageLogs.map(
    (log: { monitoredAppId: string; usedMinutes: number; entryCount: number }) => ({
      monitoredAppId: log.monitoredAppId,
      usedMinutes: log.usedMinutes,
      entryCount: log.entryCount
    })
  );
}
