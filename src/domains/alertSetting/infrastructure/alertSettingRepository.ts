import prisma from '../../../shared/database/prismaClient';

import type { NewAlertSetting, UpdateAlertSettingPayload } from '../domain/alertSettingEntity';

export async function save(alertSetting: NewAlertSetting) {
  return prisma.alertSetting.create({
    data: alertSetting
  });
}

export async function findByUserId(userId: string) {
  return prisma.alertSetting.findUnique({
    where: { userId }
  });
}

export async function findById(id: string) {
  return prisma.alertSetting.findUnique({
    where: { id }
  });
}

export async function update(id: string, payload: UpdateAlertSettingPayload) {
  return prisma.alertSetting.update({
    where: { id },
    data: payload
  });
}

export async function deleteById(id: string) {
  await prisma.alertSetting.delete({
    where: { id }
  });
}
