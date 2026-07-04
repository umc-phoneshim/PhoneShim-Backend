import AppError from '../../../shared/errors/AppError';

import {
  applyTotalGoalUpdate,
  createTotalGoal,
  type CreateTotalGoalPayload,
  type UpdateTotalGoalPayload
} from '../domain/totalGoalEntity';
import * as totalGoalRepository from '../infrastructure/totalGoalRepository';

export async function registerTotalGoal(payload: CreateTotalGoalPayload) {
  const existing = await totalGoalRepository.findByUserId(payload.userId);

  if (existing) {
    throw new AppError('이미 전체 목표가 설정되어 있습니다.', 409, 'TOTAL_GOAL_ALREADY_EXISTS');
  }

  const newTotalGoal = createTotalGoal(payload);

  return totalGoalRepository.save(newTotalGoal);
}

export async function getTotalGoalByUserId(userId: string) {
  if (!userId) {
    throw new AppError('userId는 필수입니다.', 400, 'INVALID_USER_ID');
  }

  const totalGoal = await totalGoalRepository.findByUserId(userId);

  if (!totalGoal) {
    throw new AppError('해당 유저의 전체 목표를 찾을 수 없습니다.', 404, 'TOTAL_GOAL_NOT_FOUND');
  }

  return totalGoal;
}

export async function getTotalGoalById(id: string) {
  const totalGoal = await totalGoalRepository.findById(id);

  if (!totalGoal) {
    throw new AppError('해당 전체 목표를 찾을 수 없습니다.', 404, 'TOTAL_GOAL_NOT_FOUND');
  }

  return totalGoal;
}

export async function updateTotalGoal(id: string, payload: UpdateTotalGoalPayload) {
  await getTotalGoalById(id);

  const validatedPayload = applyTotalGoalUpdate(payload);

  return totalGoalRepository.update(id, validatedPayload);
}

export async function deleteTotalGoal(id: string) {
  await getTotalGoalById(id);

  await totalGoalRepository.deleteById(id);
}
