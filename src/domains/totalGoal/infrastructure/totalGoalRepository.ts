import prisma from '../../../shared/database/prismaClient';
import {
  isPrismaKnownError,
  PRISMA_RECORD_NOT_FOUND_ERROR,
  PRISMA_UNIQUE_CONSTRAINT_ERROR
} from '../../../shared/errors/prismaError';

import type { TotalGoal, NewTotalGoal, ValidatedTotalGoalUpdate } from '../domain/totalGoalEntity';

export const UNIQUE_CONSTRAINT_ERROR = PRISMA_UNIQUE_CONSTRAINT_ERROR;
export const RECORD_NOT_FOUND_ERROR = PRISMA_RECORD_NOT_FOUND_ERROR;
export { isPrismaKnownError };

type PrismaTotalGoal = Awaited<ReturnType<typeof prisma.totalGoal.findFirst>>;

function toEntity(totalGoal: NonNullable<PrismaTotalGoal>): TotalGoal {
  return totalGoal;
}

export async function findByUserId(userId: string) {
  const totalGoal = await prisma.totalGoal.findUnique({
    where: { userId }
  });

  return totalGoal ? toEntity(totalGoal) : null;
}

export async function save(totalGoal: NewTotalGoal) {
  const created = await prisma.totalGoal.create({
    data: totalGoal
  });

  return toEntity(created);
}

export async function updateByUserId(userId: string, payload: ValidatedTotalGoalUpdate) {
  const updated = await prisma.totalGoal.update({
    where: { userId },
    data: payload
  });

  return toEntity(updated);
}
