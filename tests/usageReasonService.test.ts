import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import { createUsageReason } from '../src/domains/usageReason/application/usageReasonService';
import * as usageReasonRepository from '../src/domains/usageReason/infrastructure/usageReasonRepository';

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/usageReason/infrastructure/usageReasonRepository', () => ({
  saveMany: vi.fn()
}));

const findByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
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
