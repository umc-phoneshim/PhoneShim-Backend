import prisma from '../../../shared/database/prismaClient';

// 메인 화면 오늘 요약은 폰 전체 스크린타임 기준입니다(주의 앱 사용량 합계 아님).
// 그 날 daily_device_usage 기록이 없으면 아직 사용 데이터가 없는 것으로 보고 0을 반환합니다.
export async function findDeviceUsedMinutes(userId: string, date: Date): Promise<number> {
  const deviceUsage = await prisma.dailyDeviceUsage.findUnique({
    where: { userId_date: { userId, date } },
    select: { totalUsedMinutes: true }
  });

  return deviceUsage?.totalUsedMinutes ?? 0;
}

export async function findTotalTargetMinutes(userId: string): Promise<number | null> {
  const totalGoal = await prisma.totalGoal.findUnique({
    where: { userId },
    select: { targetMinutes: true }
  });

  return totalGoal?.targetMinutes ?? null;
}
