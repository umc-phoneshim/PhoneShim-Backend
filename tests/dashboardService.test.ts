import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDailyUsageSummary } from '../src/domains/dashboard/application/dashboardService';
import * as dashboardRepository from '../src/domains/dashboard/infrastructure/dashboardRepository';

vi.mock('../src/domains/dashboard/infrastructure/dashboardRepository', () => ({
  findTotalTargetMinutes: vi.fn(),
  sumUsedMinutes: vi.fn()
}));

const findTotalTargetMinutesMock = vi.mocked(dashboardRepository.findTotalTargetMinutes);
const sumUsedMinutesMock = vi.mocked(dashboardRepository.sumUsedMinutes);

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects a blank user id', async () => {
    await expect(getDailyUsageSummary(' ')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    });
  });

  it('builds the daily usage summary for today in KST', async () => {
    sumUsedMinutesMock.mockResolvedValueOnce(45);
    findTotalTargetMinutesMock.mockResolvedValueOnce(60);

    await expect(getDailyUsageSummary('user-1')).resolves.toEqual({
      date: '2026-07-16',
      targetMinutes: 60,
      usedMinutes: 45,
      remainingMinutes: 15,
      isExceeded: false
    });

    expect(sumUsedMinutesMock).toHaveBeenCalledWith('user-1', new Date('2026-07-16T00:00:00.000Z'));
    expect(findTotalTargetMinutesMock).toHaveBeenCalledWith('user-1');
  });
});
