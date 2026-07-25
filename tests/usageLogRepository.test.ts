import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findAllByUserIdAndDate,
  findAllByUserIdForDate,
  upsertDaily
} from '../src/domains/usageLog/infrastructure/usageLogRepository';
import prisma from '../src/shared/database/prismaClient';

vi.mock('../src/shared/database/prismaClient', () => ({
  default: {
    usageLog: {
      findMany: vi.fn(),
      upsert: vi.fn()
    }
  }
}));

const usageLogFindManyMock = vi.mocked(prisma.usageLog.findMany);
const usageLogUpsertMock = vi.mocked(prisma.usageLog.upsert);

describe('usageLogRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts by user, monitored app, and date', async () => {
    const usageLog = {
      userId: 'user-1',
      monitoredAppId: 'app-1',
      date: new Date('2026-07-16T00:00:00.000Z'),
      usedMinutes: 30,
      entryCount: 2
    };
    usageLogUpsertMock.mockResolvedValueOnce({ id: 'log-1', ...usageLog } as never);

    await upsertDaily(usageLog);

    expect(usageLogUpsertMock).toHaveBeenCalledWith({
      where: {
        userId_monitoredAppId_date: {
          userId: 'user-1',
          monitoredAppId: 'app-1',
          date: new Date('2026-07-16T00:00:00.000Z')
        }
      },
      update: {
        usedMinutes: 30,
        entryCount: 2
      },
      create: usageLog
    });
  });

  it('returns an empty summary list without querying when app ids are empty', async () => {
    await expect(
      findAllByUserIdAndDate('user-1', [], new Date('2026-07-16T00:00:00.000Z'))
    ).resolves.toEqual([]);
    expect(usageLogFindManyMock).not.toHaveBeenCalled();
  });

  it('finds and maps daily summaries for selected app ids', async () => {
    usageLogFindManyMock.mockResolvedValueOnce([
      {
        monitoredAppId: 'app-1',
        usedMinutes: 30,
        entryCount: 2
      }
    ] as never);

    await expect(
      findAllByUserIdAndDate('user-1', ['app-1'], new Date('2026-07-16T00:00:00.000Z'))
    ).resolves.toEqual([{ monitoredAppId: 'app-1', usedMinutes: 30, entryCount: 2 }]);
    expect(usageLogFindManyMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        monitoredAppId: { in: ['app-1'] },
        date: new Date('2026-07-16T00:00:00.000Z')
      }
    });
  });

  it('finds raw usage logs for a user and date ordered by creation time', async () => {
    usageLogFindManyMock.mockResolvedValueOnce([]);

    await findAllByUserIdForDate('user-1', new Date('2026-07-16T00:00:00.000Z'));

    expect(usageLogFindManyMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        date: new Date('2026-07-16T00:00:00.000Z')
      },
      orderBy: { createdAt: 'asc' }
    });
  });
});
