import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as appGoalRepository from '../src/domains/appGoal/infrastructure/appGoalRepository';
import * as deviceUsageRepository from '../src/domains/deviceUsage/infrastructure/deviceUsageRepository';
import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import * as totalGoalRepository from '../src/domains/totalGoal/infrastructure/totalGoalRepository';
import {
  getTodayUsageStatus,
  getUsageCalendar,
  getUsageLogsByDate,
  recordUsageLog
} from '../src/domains/usageLog/application/usageLogService';
import * as usageLogRepository from '../src/domains/usageLog/infrastructure/usageLogRepository';

vi.mock('../src/domains/appGoal/infrastructure/appGoalRepository', () => ({
  findAllByMonitoredAppIds: vi.fn()
}));

vi.mock('../src/domains/deviceUsage/infrastructure/deviceUsageRepository', () => ({
  findAllByUserIdInRange: vi.fn()
}));

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findAllByUserId: vi.fn(),
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/totalGoal/infrastructure/totalGoalRepository', () => ({
  findByUserId: vi.fn()
}));

vi.mock('../src/domains/usageLog/infrastructure/usageLogRepository', () => ({
  findAllByUserIdAndDate: vi.fn(),
  findAllByUserIdForDate: vi.fn(),
  findAllByUserIdInRange: vi.fn(),
  upsertDaily: vi.fn()
}));

const findAllGoalsByMonitoredAppIdsMock = vi.mocked(appGoalRepository.findAllByMonitoredAppIds);
const findDeviceUsageInRangeMock = vi.mocked(deviceUsageRepository.findAllByUserIdInRange);
const findAllAppsByUserIdMock = vi.mocked(monitoredAppRepository.findAllByUserId);
const findAppByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const findTotalGoalByUserIdMock = vi.mocked(totalGoalRepository.findByUserId);
const findAllByUserIdAndDateMock = vi.mocked(usageLogRepository.findAllByUserIdAndDate);
const findAllByUserIdForDateMock = vi.mocked(usageLogRepository.findAllByUserIdForDate);
const findUsageLogsInRangeMock = vi.mocked(usageLogRepository.findAllByUserIdInRange);
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

  it('returns an empty calendar without querying usage when the user has no total goal', async () => {
    findTotalGoalByUserIdMock.mockResolvedValueOnce(null);

    await expect(getUsageCalendar('user-1', '2026-07')).resolves.toEqual({
      month: '2026-07',
      achievedDates: []
    });
    expect(findDeviceUsageInRangeMock).not.toHaveBeenCalled();
    expect(findUsageLogsInRangeMock).not.toHaveBeenCalled();
  });

  it('builds the calendar from total phone screen time, not the monitored app sum', async () => {
    const at = (date: string) => new Date(`${date}T00:00:00.000Z`);

    findTotalGoalByUserIdMock.mockResolvedValueOnce({
      id: 'goal-1',
      userId: 'user-1',
      targetMinutes: 120,
      restrictAfter: false,
      createdAt: at('2026-07-01'),
      updatedAt: at('2026-07-01')
    });
    findAllAppsByUserIdMock.mockResolvedValueOnce([monitoredApp]);
    findDeviceUsageInRangeMock.mockResolvedValueOnce([
      {
        id: 'du-1',
        userId: 'user-1',
        date: at('2026-07-01'),
        totalUsedMinutes: 100,
        createdAt: at('2026-07-01'),
        updatedAt: at('2026-07-01')
      },
      {
        id: 'du-2',
        userId: 'user-1',
        date: at('2026-07-02'),
        totalUsedMinutes: 200,
        createdAt: at('2026-07-02'),
        updatedAt: at('2026-07-02')
      }
    ]);
    findUsageLogsInRangeMock.mockResolvedValueOnce([
      {
        id: 'log-1',
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: at('2026-07-01'),
        usedMinutes: 30,
        entryCount: 2,
        createdAt: at('2026-07-01'),
        updatedAt: at('2026-07-01')
      }
    ]);
    findAllGoalsByMonitoredAppIdsMock.mockResolvedValueOnce([
      {
        id: 'goal-app-1',
        monitoredAppId: 'app-1',
        targetMinutes: 60,
        targetCount: 3,
        restrictAfter: false,
        goalReason: null,
        createdAt: at('2026-07-01'),
        updatedAt: at('2026-07-01')
      }
    ]);

    // 07-01은 폰 전체 100분(<=120) → 달성. 07-02는 폰 전체 200분(>120) → 달성 아님.
    await expect(getUsageCalendar('user-1', '2026-07')).resolves.toEqual({
      month: '2026-07',
      achievedDates: ['2026-07-01']
    });
    expect(findDeviceUsageInRangeMock).toHaveBeenCalledWith(
      'user-1',
      at('2026-07-01'),
      at('2026-07-31')
    );
  });
});
