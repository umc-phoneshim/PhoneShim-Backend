import prisma from '../../../shared/database/prismaClient';

import type { NewUsageSession } from '../domain/usageSessionEntity';

// 앱 사용 세션 하나를 저장. 하루에 앱당 여러 건이 쌓일 수 있음
export async function save(usageSession: NewUsageSession) {
  return prisma.usageSession.create({
    data: {
      userId: usageSession.userId,
      monitoredAppId: usageSession.monitoredAppId,
      date: usageSession.date,
      startTime: usageSession.startTime,
      endTime: usageSession.endTime
    }
  });
}

// REP101 타임테이블: 특정 날짜의 세션을 시작 시각 오름차순으로 조회
export async function findAllByUserIdAndDate(userId: string, date: Date) {
  return prisma.usageSession.findMany({
    where: { userId, date },
    orderBy: { startTime: 'asc' }
  });
}
