import prisma from '../../../shared/database/prismaClient';

import type { NewDeviceUsage } from '../domain/deviceUsageEntity';

// 같은 사용자, 같은 날짜의 기기 전체 사용량은 upsert로 갱신
export async function upsertDaily(deviceUsage: NewDeviceUsage) {
  return prisma.dailyDeviceUsage.upsert({
    where: {
      userId_date: {
        userId: deviceUsage.userId,
        date: deviceUsage.date
      }
    },
    update: {
      totalUsedMinutes: deviceUsage.totalUsedMinutes
    },
    create: deviceUsage
  });
}

// REP106 캘린더: 한 달 범위(startDate ~ endDate)의 기기 전체 사용량 기록을 전부 가져옵니다.
export async function findAllByUserIdInRange(userId: string, startDate: Date, endDate: Date) {
  return prisma.dailyDeviceUsage.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate }
    }
  });
}
