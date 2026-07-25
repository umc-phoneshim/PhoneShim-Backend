import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import {
  createAppGoal,
  deleteAppGoal,
  getAppGoalByMonitoredAppId,
  updateAppGoal
} from '../src/domains/appGoal/application/appGoalService';
import * as appGoalRepository from '../src/domains/appGoal/infrastructure/appGoalRepository';

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/appGoal/infrastructure/appGoalRepository', () => ({
  RECORD_NOT_FOUND_ERROR: 'P2025',
  UNIQUE_CONSTRAINT_ERROR: 'P2002',
  deleteById: vi.fn(),
  findById: vi.fn(),
  findByMonitoredAppId: vi.fn(),
  isPrismaKnownError: vi.fn(),
  save: vi.fn(),
  updateById: vi.fn()
}));

const findMonitoredAppByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const deleteByIdMock = vi.mocked(appGoalRepository.deleteById);
const findByIdMock = vi.mocked(appGoalRepository.findById);
const findByMonitoredAppIdMock = vi.mocked(appGoalRepository.findByMonitoredAppId);
const isPrismaKnownErrorMock = vi.mocked(appGoalRepository.isPrismaKnownError);
const saveMock = vi.mocked(appGoalRepository.save);
const updateByIdMock = vi.mocked(appGoalRepository.updateById);

const monitoredApp = {
  id: 'app-1',
  userId: 'user-1',
  packageName: 'com.example.app',
  appName: 'Example',
  appIcon: null,
  sortOrder: 0,
  createdAt: new Date('2026-07-16T00:00:00.000Z'),
  updatedAt: new Date('2026-07-16T00:00:00.000Z')
};

const appGoal = {
  id: 'goal-1',
  monitoredAppId: 'app-1',
  targetMinutes: 30,
  targetCount: 2,
  restrictAfter: false,
  goalReason: null,
  createdAt: new Date('2026-07-16T00:00:00.000Z'),
  updatedAt: new Date('2026-07-16T00:00:00.000Z')
};

describe('appGoalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPrismaKnownErrorMock.mockReturnValue(false);
  });

  it('creates an app goal after monitored app ownership and duplicate checks', async () => {
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByMonitoredAppIdMock.mockResolvedValueOnce(null);
    saveMock.mockResolvedValueOnce(appGoal);

    await expect(
      createAppGoal('user-1', {
        monitoredAppId: 'app-1',
        targetMinutes: 30,
        targetCount: 2
      })
    ).resolves.toBe(appGoal);

    expect(findMonitoredAppByIdAndUserIdMock).toHaveBeenCalledWith('app-1', 'user-1');
    expect(saveMock).toHaveBeenCalledWith({
      monitoredAppId: 'app-1',
      targetMinutes: 30,
      targetCount: 2,
      restrictAfter: false,
      goalReason: null
    });
  });

  it('rejects creating a goal for a missing monitored app', async () => {
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(
      createAppGoal('user-1', {
        monitoredAppId: 'app-1',
        targetMinutes: 30,
        targetCount: 2
      })
    ).rejects.toMatchObject({ statusCode: 404, code: 'MONITORED_APP_NOT_FOUND' });

    expect(saveMock).not.toHaveBeenCalled();
  });

  it('rejects creating a duplicate app goal', async () => {
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByMonitoredAppIdMock.mockResolvedValueOnce(appGoal);

    await expect(
      createAppGoal('user-1', {
        monitoredAppId: 'app-1',
        targetMinutes: 30,
        targetCount: 2
      })
    ).rejects.toMatchObject({ statusCode: 409, code: 'APP_GOAL_ALREADY_EXISTS' });
  });

  it('maps unique constraint errors while saving to duplicate app goal errors', async () => {
    const error = new Error('unique');
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByMonitoredAppIdMock.mockResolvedValueOnce(null);
    saveMock.mockRejectedValueOnce(error);
    isPrismaKnownErrorMock.mockReturnValueOnce(true);

    await expect(
      createAppGoal('user-1', {
        monitoredAppId: 'app-1',
        targetMinutes: 30,
        targetCount: 2
      })
    ).rejects.toMatchObject({ statusCode: 409, code: 'APP_GOAL_ALREADY_EXISTS' });
  });

  it('gets an app goal only when the monitored app is owned by the user', async () => {
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByMonitoredAppIdMock.mockResolvedValueOnce(appGoal);

    await expect(getAppGoalByMonitoredAppId('user-1', 'app-1')).resolves.toBe(appGoal);
  });

  it('rejects a missing app goal', async () => {
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    findByMonitoredAppIdMock.mockResolvedValueOnce(null);

    await expect(getAppGoalByMonitoredAppId('user-1', 'app-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'APP_GOAL_NOT_FOUND'
    });
  });

  it('rejects updating an app goal that is not owned by the user', async () => {
    findByIdMock.mockResolvedValueOnce(appGoal);
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(updateAppGoal('goal-1', 'user-1', { targetMinutes: 60 })).rejects.toMatchObject({
      statusCode: 404,
      code: 'APP_GOAL_NOT_FOUND'
    });
  });

  it('maps record not found errors while updating to app goal not found', async () => {
    const error = new Error('not found');
    findByIdMock.mockResolvedValueOnce(appGoal);
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    updateByIdMock.mockRejectedValueOnce(error);
    isPrismaKnownErrorMock.mockReturnValueOnce(true);

    await expect(updateAppGoal('goal-1', 'user-1', { targetMinutes: 60 })).rejects.toMatchObject({
      statusCode: 404,
      code: 'APP_GOAL_NOT_FOUND'
    });
  });

  it('checks ownership before deleting an app goal', async () => {
    findByIdMock.mockResolvedValueOnce(appGoal);
    findMonitoredAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    deleteByIdMock.mockResolvedValueOnce(undefined);

    await deleteAppGoal('goal-1', 'user-1');

    expect(deleteByIdMock).toHaveBeenCalledWith('goal-1');
  });
});
