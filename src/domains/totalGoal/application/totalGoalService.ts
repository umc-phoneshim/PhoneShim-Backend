import { AppError, NotFoundError } from '../../../shared/errors/appError';

import {
  createTotalGoalEntity,
  createTotalGoalUpdate,
  type CreateTotalGoalPayload,
  type UpdateTotalGoalPayload
} from '../domain/totalGoalEntity';
import * as totalGoalRepository from '../infrastructure/totalGoalRepository';

const totalGoalAlreadyExists = () =>
  new AppError(409, 'TOTAL_GOAL_ALREADY_EXISTS', 'Total goal already exists for this user');

const totalGoalNotFound = () => new NotFoundError('Total goal was not found', 'TOTAL_GOAL_NOT_FOUND');

// POST /api/total-goals
export async function createTotalGoal(userId: string, payload: CreateTotalGoalPayload) {
  const existing = await totalGoalRepository.findByUserId(userId);

  if (existing) {
    throw totalGoalAlreadyExists();
  }

  const totalGoal = createTotalGoalEntity(userId, payload);

  try {
    return await totalGoalRepository.save(totalGoal);
  } catch (error) {
    if (totalGoalRepository.isPrismaKnownError(error, totalGoalRepository.UNIQUE_CONSTRAINT_ERROR)) {
      throw totalGoalAlreadyExists();
    }

    throw error;
  }
}

// GET /api/total-goals
export async function getTotalGoal(userId: string) {
  const totalGoal = await totalGoalRepository.findByUserId(userId);

  if (!totalGoal) {
    throw totalGoalNotFound();
  }

  return totalGoal;
}

// PATCH /api/total-goals
export async function updateTotalGoal(userId: string, payload: UpdateTotalGoalPayload) {
  const existing = await totalGoalRepository.findByUserId(userId);

  if (!existing) {
    throw totalGoalNotFound();
  }

  const update = createTotalGoalUpdate(payload);

  try {
    return await totalGoalRepository.updateByUserId(userId, update);
  } catch (error) {
    if (totalGoalRepository.isPrismaKnownError(error, totalGoalRepository.RECORD_NOT_FOUND_ERROR)) {
      throw totalGoalNotFound();
    }

    throw error;
  }
}
