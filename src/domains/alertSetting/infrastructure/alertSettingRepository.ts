import prisma from '../../../shared/database/prismaClient';

// 알림 설정 조회 (없으면 기본값으로 생성)
// 동시 요청이 와도 안전하도록 upsert로 한 번에 처리
export async function findOrCreateByUserId(userId: string) {
  return prisma.alertSetting.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      enabled: true,
      alertTimeMinutes: 1320
    }
  });
}

// 알림 시간 수정 (없으면 생성)
// 동시 요청이 와도 안전하도록 upsert로 한 번에 처리
export async function updateAlertTimeMinutes(userId: string, alertTimeMinutes: number) {
  return prisma.alertSetting.upsert({
    where: { userId },
    update: { alertTimeMinutes },
    create: {
      userId,
      enabled: true,
      alertTimeMinutes
    }
  });
}
