import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTotalGoal,
  getTotalGoal,
  updateTotalGoal
} from '../src/domains/totalGoal/application/totalGoalService';
import * as totalGoalRepository from '../src/domains/totalGoal/infrastructure/totalGoalRepository';

vi.mock('../src/domains/totalGoal/infrastructure/totalGoalRepository', () => ({
  RECORD_NOT_FOUND_ERROR: 'P2025',
  UNIQUE_CONSTRAINT_ERROR: 'P2002',
  findByUserId: vi.fn(),
  isPrismaKnownError: vi.fn(),
  save: vi.fn(),
  updateByUserId: vi.fn()
}));

const findByUserIdMock = vi.mocked(totalGoalRepository.findByUserId);
const isPrismaKnownErrorMock = vi.mocked(totalGoalRepository.isPrismaKnownError);
const saveMock = vi.mocked(totalGoalRepository.save);
const updateByUserIdMock = vi.mocked(totalGoalRepository.updateByUserId);

const totalGoal = {
  id: 'goal-1',
  userId: 'user-1',
  targetMinutes: 30,
  restrictAfter: false,
  createdAt: new Date('2026-07-16T00:00:00.000Z'),
  updatedAt: new Date('2026-07-16T00:00:00.000Z')
};

describe('totalGoalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPrismaKnownErrorMock.mockReturnValue(false);
  });

  it('creates a total goal when the user does not have one', async () => {
    findByUserIdMock.mockResolvedValueOnce(null);
    saveMock.mockResolvedValueOnce(totalGoal);

    await expect(createTotalGoal('user-1', { targetMinutes: 30 })).resolves.toBe(totalGoal);
    expect(saveMock).toHaveBeenCalledWith({
      userId: 'user-1',
      targetMinutes: 30,
      restrictAfter: false
    });
  });

  it('rejects creating a duplicate total goal', async () => {
    findByUserIdMock.mockResolvedValueOnce(totalGoal);

    await expect(createTotalGoal('user-1', { targetMinutes: 30 })).rejects.toMatchObject({
      statusCode: 409,
      code: 'TOTAL_GOAL_ALREADY_EXISTS'
    });
  });

  it('maps unique constraint errors while saving', async () => {
    const error = new Error('unique');
    findByUserIdMock.mockResolvedValueOnce(null);
    saveMock.mockRejectedValueOnce(error);
    isPrismaKnownErrorMock.mockReturnValueOnce(true);

    await expect(createTotalGoal('user-1', { targetMinutes: 30 })).rejects.toMatchObject({
      statusCode: 409,
      code: 'TOTAL_GOAL_ALREADY_EXISTS'
    });
  });

  it('gets an existing total goal', async () => {
    findByUserIdMock.mockResolvedValueOnce(totalGoal);

    await expect(getTotalGoal('user-1')).resolves.toBe(totalGoal);
  });

  it('rejects getting a missing total goal', async () => {
    findByUserIdMock.mockResolvedValueOnce(null);

    await expect(getTotalGoal('user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'TOTAL_GOAL_NOT_FOUND'
    });
  });

  it('updates an existing total goal', async () => {
    findByUserIdMock.mockResolvedValueOnce(totalGoal);
    updateByUserIdMock.mockResolvedValueOnce({ ...totalGoal, targetMinutes: 60 });

    await updateTotalGoal('user-1', { targetMinutes: 60 });

    expect(updateByUserIdMock).toHaveBeenCalledWith('user-1', { targetMinutes: 60 });
  });

  it('rejects updating a missing total goal', async () => {
    findByUserIdMock.mockResolvedValueOnce(null);

    await expect(updateTotalGoal('user-1', { targetMinutes: 60 })).rejects.toMatchObject({
      statusCode: 404,
      code: 'TOTAL_GOAL_NOT_FOUND'
    });
  });

  it('maps record not found errors while updating', async () => {
    const error = new Error('not found');
    findByUserIdMock.mockResolvedValueOnce(totalGoal);
    updateByUserIdMock.mockRejectedValueOnce(error);
    isPrismaKnownErrorMock.mockReturnValueOnce(true);

    await expect(updateTotalGoal('user-1', { targetMinutes: 60 })).rejects.toMatchObject({
      statusCode: 404,
      code: 'TOTAL_GOAL_NOT_FOUND'
    });
  });
});
