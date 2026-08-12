import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import {
  createUsageReason,
  getUsageReasonCalendar
} from '../src/domains/usageReason/application/usageReasonService';
import * as usageReasonRepository from '../src/domains/usageReason/infrastructure/usageReasonRepository';

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/usageReason/infrastructure/usageReasonRepository', () => ({
  findAllByUserIdInRange: vi.fn(),
  saveMany: vi.fn()
}));

const findByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const findAllByUserIdInRangeMock = vi.mocked(usageReasonRepository.findAllByUserIdInRange);
const saveManyMock = vi.mocked(usageReasonRepository.saveMany);

const payload = {
  userId: 'user-1',
  monitoredAppId: 'app-1',
  date: '2026-07-16',
  timeRangeStart: '2026-07-16T12:00:00.000Z',
  timeRangeEnd: '2026-07-16T12:30:00.000Z',
  reasonCodes: ['LEISURE', 'HABIT']
};

const savedRow = (id: string, reason: string) => ({
  id,
  userId: 'user-1',
  monitoredAppId: 'app-1',
  usageLogId: null,
  date: new Date('2026-07-16T00:00:00.000Z'),
  timeRangeStart: new Date('2026-07-16T12:00:00.000Z'),
  timeRangeEnd: new Date('2026-07-16T12:30:00.000Z'),
  reason,
  createdAt: new Date('2026-07-16T13:00:00.000Z'),
  updatedAt: new Date('2026-07-16T13:00:00.000Z')
});

describe('usageReasonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects creating a usage reason for a missing monitored app', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(createUsageReason(payload)).rejects.toMatchObject({
      statusCode: 404,
      code: 'MONITORED_APP_NOT_FOUND'
    });
    expect(saveManyMock).not.toHaveBeenCalled();
  });

  it('rejects creating a usage reason outside the allowed time window', async () => {
    vi.setSystemTime(new Date('2026-07-16T12:59:59.999Z'));
    findByIdAndUserIdMock.mockResolvedValueOnce({ id: 'app-1' } as never);

    await expect(createUsageReason(payload)).rejects.toMatchObject({
      statusCode: 403,
      code: 'USAGE_REASON_TIME_FORBIDDEN'
    });
    expect(saveManyMock).not.toHaveBeenCalled();
  });

  it('saves one record per reason code inside the allowed time window', async () => {
    vi.setSystemTime(new Date('2026-07-16T13:00:00.000Z'));
    findByIdAndUserIdMock.mockResolvedValueOnce({ id: 'app-1' } as never);
    saveManyMock.mockResolvedValueOnce([
      savedRow('reason-1', 'LEISURE'),
      savedRow('reason-2', 'HABIT')
    ] as never);

    await expect(createUsageReason(payload)).resolves.toMatchObject([
      { id: 'reason-1', date: '2026-07-16', reason: 'LEISURE' },
      { id: 'reason-2', date: '2026-07-16', reason: 'HABIT' }
    ]);
    expect(saveManyMock).toHaveBeenCalledOnce();
  });
});

describe('getUsageReasonCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns every date in the month with reason presence', async () => {
    findAllByUserIdInRangeMock.mockResolvedValueOnce([
      { date: new Date('2026-07-01T00:00:00.000Z') },
      { date: new Date('2026-07-01T00:00:00.000Z') },
      { date: new Date('2026-07-03T00:00:00.000Z') }
    ] as never);

    const result = await getUsageReasonCalendar('user-1', '2026-07');

    expect(result.slice(0, 3)).toEqual([
      { date: '2026-07-01', hasReason: true },
      { date: '2026-07-02', hasReason: false },
      { date: '2026-07-03', hasReason: true }
    ]);
    expect(result).toHaveLength(31);
    expect(findAllByUserIdInRangeMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-01T00:00:00.000Z'),
      new Date('2026-07-31T00:00:00.000Z')
    );
  });
});
