import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getReportSummary } from '../src/domains/report/application/reportService';
import * as reportRepository from '../src/domains/report/infrastructure/reportRepository';

vi.mock('../src/domains/report/infrastructure/reportRepository', () => ({
  findUsageReasonsInRange: vi.fn()
}));

const findUsageReasonsInRangeMock = vi.mocked(reportRepository.findUsageReasonsInRange);

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
