import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as appGoalRepository from '../src/domains/appGoal/infrastructure/appGoalRepository';
import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import {
  getTodayUsageStatus,
  getUsageLogsByDate,
  recordUsageLog
} from '../src/domains/usageLog/application/usageLogService';
import * as usageLogRepository from '../src/domains/usageLog/infrastructure/usageLogRepository';

vi.mock('../src/domains/appGoal/infrastructure/appGoalRepository', () => ({
  findAllByMonitoredAppIds: vi.fn()
}));

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findAllByUserId: vi.fn(),
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/usageLog/infrastructure/usageLogRepository', () => ({
  findAllByUserIdAndDate: vi.fn(),
  findAllByUserIdForDate: vi.fn(),
  upsertDaily: vi.fn()
}));

const findAllGoalsByMonitoredAppIdsMock = vi.mocked(appGoalRepository.findAllByMonitoredAppIds);
const findAllAppsByUserIdMock = vi.mocked(monitoredAppRepository.findAllByUserId);
const findAppByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const findAllByUserIdAndDateMock = vi.mocked(usageLogRepository.findAllByUserIdAndDate);
const findAllByUserIdForDateMock = vi.mocked(usageLogRepository.findAllByUserIdForDate);
const upsertDailyMock = vi.mocked(usageLogRepository.upsertDaily);

const monitoredApp = {
  id: 'app-1',
  userId: 'user-1',
  packageName: 'com.example.app',
  appName: 'Example',
  appIcon: null,
  sortOrder: 2,
  createdAt: new Date('2026-07-16T00:00:00.000Z'),
  updatedAt: new Date('2026-07-16T00:00:00.000Z')
};

describe('usageLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records a usage log for an owned monitored app', async () => {
    findAppByIdAndUserIdMock.mockResolvedValueOnce(monitoredApp);
    upsertDailyMock.mockResolvedValueOnce({
      id: 'log-1',
      userId: 'user-1',
      monitoredAppId: 'app-1',
      date: new Date('2026-07-16T00:00:00.000Z'),
      usedMinutes: 30,
      entryCount: 2,
      createdAt: new Date('2026-07-16T00:00:00.000Z'),
      updatedAt: new Date('2026-07-16T00:00:00.000Z')
    });

    await recordUsageLog({
      userId: 'user-1',
      monitoredAppId: 'app-1',
      date: '2026-07-16',
      usedMinutes: 30,
      entryCount: 2
    });

    expect(upsertDailyMock).toHaveBeenCalledWith({
      userId: 'user-1',
      monitoredAppId: 'app-1',
      date: new Date('2026-07-16T00:00:00.000Z'),
      usedMinutes: 30,
      entryCount: 2
    });
  });

  it('rejects recording a usage log for a missing monitored app', async () => {
    findAppByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(
      recordUsageLog({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        usedMinutes: 30,
        entryCount: 2
      })
    ).rejects.toMatchObject({ statusCode: 404, code: 'MONITORED_APP_NOT_FOUND' });

    expect(upsertDailyMock).not.toHaveBeenCalled();
  });

  it('gets usage logs by date with formatted date strings', async () => {
    findAllByUserIdForDateMock.mockResolvedValueOnce([
      {
        id: 'log-1',
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: new Date('2026-07-16T00:00:00.000Z'),
        usedMinutes: 30,
        entryCount: 2,
        createdAt: new Date('2026-07-16T01:00:00.000Z'),
        updatedAt: new Date('2026-07-16T01:00:00.000Z')
      }
    ]);

    await expect(getUsageLogsByDate('user-1', '2026-07-16')).resolves.toMatchObject([
      {
        id: 'log-1',
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        usedMinutes: 30,
        entryCount: 2
      }
    ]);
    expect(findAllByUserIdForDateMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('merges monitored apps, goals, and usage summaries for today and sorts by sortOrder', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));
    findAllAppsByUserIdMock.mockResolvedValueOnce([
      { ...monitoredApp, id: 'app-2', appName: 'Second', sortOrder: 2 },
      { ...monitoredApp, id: 'app-1', appName: 'First', sortOrder: 1 }
    ]);
    findAllGoalsByMonitoredAppIdsMock.mockResolvedValueOnce([
      {
        id: 'goal-1',
        monitoredAppId: 'app-1',
        targetMinutes: 20,
        targetCount: 3,
        restrictAfter: false,
        goalReason: null,
        createdAt: new Date('2026-07-16T00:00:00.000Z'),
        updatedAt: new Date('2026-07-16T00:00:00.000Z')
      }
    ]);
    findAllByUserIdAndDateMock.mockResolvedValueOnce([
      { monitoredAppId: 'app-2', usedMinutes: 40, entryCount: 5 }
    ]);

    await expect(getTodayUsageStatus('user-1')).resolves.toEqual([
      {
        monitoredAppId: 'app-1',
        appName: 'First',
        packageName: 'com.example.app',
        appIcon: null,
        sortOrder: 1,
        targetMinutes: 20,
        targetCount: 3,
        usedMinutes: 0,
        entryCount: 0
      },
      {
        monitoredAppId: 'app-2',
        appName: 'Second',
        packageName: 'com.example.app',
        appIcon: null,
        sortOrder: 2,
        targetMinutes: null,
        targetCount: null,
        usedMinutes: 40,
        entryCount: 5
      }
    ]);

    expect(findAllByUserIdAndDateMock).toHaveBeenCalledWith(
      'user-1',
      ['app-2', 'app-1'],
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('returns an empty usage status list when no monitored apps exist', async () => {
    findAllAppsByUserIdMock.mockResolvedValueOnce([]);

    await expect(getTodayUsageStatus('user-1')).resolves.toEqual([]);
    expect(findAllGoalsByMonitoredAppIdsMock).not.toHaveBeenCalled();
    expect(findAllByUserIdAndDateMock).not.toHaveBeenCalled();
  });
});
