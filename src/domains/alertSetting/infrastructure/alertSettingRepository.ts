import prisma from '../../../shared/database/prismaClient';



// 알림 설정 조회
export async function findOrCreateByUserId(userId: string) {
  const existing = await prisma.alertSetting.findUnique({ where: { userId } });

  if (existing) {
    return existing;
  }

  return prisma.alertSetting.create({
    data: {
      userId,
      enabled: true,
      alertTimeMinutes: 1320
    }
  });
}


// 알림 시간 수정
export async function updateAlertTimeMinutes(userId: string, alertTimeMinutes: number) {
  const existing = await prisma.alertSetting.findUnique({ where: { userId } });

  if (existing) {
    return prisma.alertSetting.update({
      where: { userId },
      data: { alertTimeMinutes }
    });
  }

  return prisma.alertSetting.create({
    data: {
      userId,
      enabled: true,
      alertTimeMinutes
    }
  });
}
