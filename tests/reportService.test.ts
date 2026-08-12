import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as appGoalRepository from '../src/domains/appGoal/infrastructure/appGoalRepository';
import * as deviceUsageRepository from '../src/domains/deviceUsage/infrastructure/deviceUsageRepository';
import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import {
  getReportSummary,
  getReportSuggestion
} from '../src/domains/report/application/reportService';
import * as reportRepository from '../src/domains/report/infrastructure/reportRepository';
import * as totalGoalRepository from '../src/domains/totalGoal/infrastructure/totalGoalRepository';
import * as usageLogRepository from '../src/domains/usageLog/infrastructure/usageLogRepository';

vi.mock('../src/domains/report/infrastructure/reportRepository', () => ({
  findUsageReasonsInRange: vi.fn()
}));

vi.mock('../src/domains/totalGoal/infrastructure/totalGoalRepository', () => ({
  findByUserId: vi.fn()
}));

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findAllByUserId: vi.fn()
}));

vi.mock('../src/domains/deviceUsage/infrastructure/deviceUsageRepository', () => ({
  findAllByUserIdInRange: vi.fn()
}));

vi.mock('../src/domains/usageLog/infrastructure/usageLogRepository', () => ({
  findAllByUserIdAndDate: vi.fn()
}));

vi.mock('../src/domains/appGoal/infrastructure/appGoalRepository', () => ({
  findAllByMonitoredAppIds: vi.fn()
}));

const findUsageReasonsInRangeMock = vi.mocked(reportRepository.findUsageReasonsInRange);
const findTotalGoalMock = vi.mocked(totalGoalRepository.findByUserId);
const findMonitoredAppsMock = vi.mocked(monitoredAppRepository.findAllByUserId);
const findDeviceUsageInRangeMock = vi.mocked(deviceUsageRepository.findAllByUserIdInRange);
const findUsageLogsByDateMock = vi.mocked(usageLogRepository.findAllByUserIdAndDate);
const findAppGoalsMock = vi.mocked(appGoalRepository.findAllByMonitoredAppIds);

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects an invalid range without querying', async () => {
    await expect(getReportSummary('user-1', 'year', '2026-07-16')).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_REPORT_RANGE'
    });
    expect(findUsageReasonsInRangeMock).not.toHaveBeenCalled();
  });

  it('builds a day summary from usage reasons in range', async () => {
    findUsageReasonsInRangeMock.mockResolvedValueOnce([
      {
        monitoredAppId: 'app-1',
        reason: 'LEISURE',
        timeRangeStart: new Date('2026-07-16T12:00:00.000Z'),
        timeRangeEnd: new Date('2026-07-16T12:30:00.000Z'),
        monitoredApp: { appName: 'YouTube' }
      }
    ] as never);

    await expect(getReportSummary('user-1', 'day', '2026-07-16')).resolves.toEqual({
      range: 'day',
      from: '2026-07-16',
      to: '2026-07-16',
      reasons: [
        {
          reason: 'LEISURE',
          totalMinutes: 30,
          apps: [{ monitoredAppId: 'app-1', appName: 'YouTube', minutes: 30 }]
        }
      ]
    });

    expect(findUsageReasonsInRangeMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-16T00:00:00.000Z'),
      new Date('2026-07-16T00:00:00.000Z')
    );
  });
});

describe('getReportSuggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns NO_GOAL without querying usage when there is no total goal', async () => {
    findTotalGoalMock.mockResolvedValueOnce(null);

    await expect(getReportSuggestion('user-1', '2026-07-16')).resolves.toMatchObject({
      suggestionType: 'NO_GOAL'
    });
    expect(findUsageLogsByDateMock).not.toHaveBeenCalled();
  });

  it('returns TOTAL_EXCEEDED using phone total screen time and the most-used app', async () => {
    findTotalGoalMock.mockResolvedValueOnce({ targetMinutes: 120 } as never);
    findMonitoredAppsMock.mockResolvedValueOnce([
      { id: 'app-1', appName: 'YouTube' },
      { id: 'app-2', appName: 'KakaoTalk' }
    ] as never);
    findDeviceUsageInRangeMock.mockResolvedValueOnce([{ totalUsedMinutes: 200 }] as never);
    findUsageLogsByDateMock.mockResolvedValueOnce([
      { monitoredAppId: 'app-1', usedMinutes: 90, entryCount: 5 },
      { monitoredAppId: 'app-2', usedMinutes: 30, entryCount: 3 }
    ] as never);
    findAppGoalsMock.mockResolvedValueOnce([
      { monitoredAppId: 'app-1', targetMinutes: 60 }
    ] as never);

    await expect(getReportSuggestion('user-1', '2026-07-16')).resolves.toMatchObject({
      suggestionType: 'TOTAL_EXCEEDED',
      excessMinutes: 80,
      appName: 'YouTube'
    });
    // 폰 전체 사용량은 daily_device_usage(그날 하루) 기준으로 조회
    expect(findDeviceUsageInRangeMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-16T00:00:00.000Z'),
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('treats a missing device-usage record as 0 minutes', async () => {
    findTotalGoalMock.mockResolvedValueOnce({ targetMinutes: 120 } as never);
    findMonitoredAppsMock.mockResolvedValueOnce([{ id: 'app-1', appName: 'YouTube' }] as never);
    findDeviceUsageInRangeMock.mockResolvedValueOnce([] as never); // 그날 폰 전체 기록 없음
    findUsageLogsByDateMock.mockResolvedValueOnce([] as never);
    findAppGoalsMock.mockResolvedValueOnce([] as never);

    await expect(getReportSuggestion('user-1', '2026-07-16')).resolves.toMatchObject({
      suggestionType: 'ACHIEVED'
    });
  });
});
