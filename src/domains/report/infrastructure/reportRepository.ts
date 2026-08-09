import prisma from '../../../shared/database/prismaClient';

// REP104 요약: 기간(from ~ to) 내 사용 사유를 주의앱 이름과 함께 조회
export async function findUsageReasonsInRange(userId: string, from: Date, to: Date) {
  return prisma.usageReason.findMany({
    where: {
      userId,
      date: { gte: from, lte: to }
    },
    include: {
      monitoredApp: {
        select: { appName: true }
      }
    }
  });
}
