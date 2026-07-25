import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import { createUsageReason } from '../src/domains/usageReason/application/usageReasonService';
import * as usageReasonRepository from '../src/domains/usageReason/infrastructure/usageReasonRepository';

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/usageReason/infrastructure/usageReasonRepository', () => ({
  save: vi.fn()
}));

const findByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const saveMock = vi.mocked(usageReasonRepository.save);

const payload = {
  userId: 'user-1',
  monitoredAppId: 'app-1',
  date: '2026-07-16',
  timeRangeStart: '2026-07-16T12:00:00.000Z',
  timeRangeEnd: '2026-07-16T12:30:00.000Z',
  reason: 'needed it'
};

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
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('rejects creating a usage reason outside the allowed time window', async () => {
    vi.setSystemTime(new Date('2026-07-16T12:59:59.999Z'));
    findByIdAndUserIdMock.mockResolvedValueOnce({ id: 'app-1' } as never);

    await expect(createUsageReason(payload)).rejects.toMatchObject({
      statusCode: 403,
      code: 'USAGE_REASON_TIME_FORBIDDEN'
    });
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('saves and formats a usage reason inside the allowed time window', async () => {
    vi.setSystemTime(new Date('2026-07-16T13:00:00.000Z'));
    findByIdAndUserIdMock.mockResolvedValueOnce({ id: 'app-1' } as never);
    saveMock.mockResolvedValueOnce({
      id: 'reason-1',
      userId: 'user-1',
      monitoredAppId: 'app-1',
      usageLogId: null,
      date: new Date('2026-07-16T00:00:00.000Z'),
      timeRangeStart: new Date('2026-07-16T12:00:00.000Z'),
      timeRangeEnd: new Date('2026-07-16T12:30:00.000Z'),
      reason: 'needed it',
      createdAt: new Date('2026-07-16T13:00:00.000Z'),
      updatedAt: new Date('2026-07-16T13:00:00.000Z')
    });

    await expect(createUsageReason(payload)).resolves.toMatchObject({
      id: 'reason-1',
      date: '2026-07-16',
      reason: 'needed it'
    });
  });
});
