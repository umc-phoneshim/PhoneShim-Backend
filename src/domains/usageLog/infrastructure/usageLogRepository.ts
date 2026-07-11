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

// API_SPEC.md의 GET /api/usage-logs?date= — usage_logs 원본 행을 그대로 반환합니다
// (monitoredApp/goal과 합치지 않음).
export async function findAllByUserIdForDate(userId: string, date: Date) {
  return prisma.usageLog.findMany({
    where: { userId, date },
    orderBy: { createdAt: 'asc' }
  });
}
