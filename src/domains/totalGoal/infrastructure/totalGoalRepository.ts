import prisma from '../../../shared/database/prismaClient';

import type { NewTotalGoal, UpdateTotalGoalPayload } from '../domain/totalGoalEntity';

export async function save(totalGoal: NewTotalGoal) {
  return prisma.totalGoal.create({
    data: totalGoal
  });
}

export async function findByUserId(userId: string) {
  return prisma.totalGoal.findUnique({
    where: { userId }
  });
}

export async function findById(id: string) {
  return prisma.totalGoal.findUnique({
    where: { id }
  });
}

export async function update(id: string, payload: UpdateTotalGoalPayload) {
  return prisma.totalGoal.update({
    where: { id },
    data: payload
  });
}

export async function deleteById(id: string) {
  await prisma.totalGoal.delete({
    where: { id }
  });
}
