import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as monitoredAppRepository from '../src/domains/monitoredApp/infrastructure/monitoredAppRepository';
import {
  createUsageSession,
  getUsageSessionsByDate
} from '../src/domains/usageSession/application/usageSessionService';
import * as usageSessionRepository from '../src/domains/usageSession/infrastructure/usageSessionRepository';

vi.mock('../src/domains/monitoredApp/infrastructure/monitoredAppRepository', () => ({
  findByIdAndUserId: vi.fn()
}));

vi.mock('../src/domains/usageSession/infrastructure/usageSessionRepository', () => ({
  save: vi.fn(),
  findByUserAppAndDate: vi.fn(),
  findAllByUserIdAndDate: vi.fn()
}));

const findByIdAndUserIdMock = vi.mocked(monitoredAppRepository.findByIdAndUserId);
const saveMock = vi.mocked(usageSessionRepository.save);
const findByUserAppAndDateMock = vi.mocked(usageSessionRepository.findByUserAppAndDate);
const findAllByUserIdAndDateMock = vi.mocked(usageSessionRepository.findAllByUserIdAndDate);

const payload = {
  userId: 'user-1',
  monitoredAppId: 'app-1',
  startTime: '2026-07-16T12:00:00.000Z',
  endTime: '2026-07-16T12:30:00.000Z'
};

const savedRow = {
  id: 'session-1',
  userId: 'user-1',
  monitoredAppId: 'app-1',
  date: new Date('2026-07-16T00:00:00.000Z'),
  startTime: new Date('2026-07-16T12:00:00.000Z'),
  endTime: new Date('2026-07-16T12:30:00.000Z'),
  createdAt: new Date('2026-07-16T12:30:10.000Z'),
  updatedAt: new Date('2026-07-16T12:30:10.000Z')
};

describe('usageSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects creating a session for a missing monitored app', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(createUsageSession(payload)).rejects.toMatchObject({
      statusCode: 404,
      code: 'MONITORED_APP_NOT_FOUND'
    });
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('rejects a session that overlaps an existing one on the same day', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce({ id: 'app-1' } as never);
    findByUserAppAndDateMock.mockResolvedValueOnce([
      {
        startTime: new Date('2026-07-16T12:15:00.000Z'),
        endTime: new Date('2026-07-16T12:45:00.000Z')
      }
    ] as never);

    await expect(createUsageSession(payload)).rejects.toMatchObject({
      statusCode: 409,
      code: 'USAGE_SESSION_OVERLAP'
    });
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('saves a session (date derived from startTime) when there is no overlap', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce({ id: 'app-1' } as never);
    findByUserAppAndDateMock.mockResolvedValueOnce([] as never);
    saveMock.mockResolvedValueOnce(savedRow as never);

    await expect(createUsageSession(payload)).resolves.toMatchObject({
      id: 'session-1',
      date: '2026-07-16',
      startTime: new Date('2026-07-16T12:00:00.000Z'),
      endTime: new Date('2026-07-16T12:30:00.000Z')
    });
    // 겹침 검사는 startTime에서 파생한 날짜(2026-07-16)로 조회
    expect(findByUserAppAndDateMock).toHaveBeenCalledWith(
      'user-1',
      'app-1',
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('gets sessions for a date with a formatted date string', async () => {
    findAllByUserIdAndDateMock.mockResolvedValueOnce([savedRow] as never);

    await expect(getUsageSessionsByDate('user-1', '2026-07-16')).resolves.toMatchObject([
      { id: 'session-1', date: '2026-07-16' }
    ]);
    expect(findAllByUserIdAndDateMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('uses KST today when no date is given', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));
    findAllByUserIdAndDateMock.mockResolvedValueOnce([] as never);

    await getUsageSessionsByDate('user-1');

    expect(findAllByUserIdAndDateMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-16T00:00:00.000Z')
    );
  });
});
