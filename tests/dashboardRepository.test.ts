import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findDeviceUsedMinutes,
  findTotalTargetMinutes
} from '../src/domains/dashboard/infrastructure/dashboardRepository';
import prisma from '../src/shared/database/prismaClient';

vi.mock('../src/shared/database/prismaClient', () => ({
  default: {
    dailyDeviceUsage: {
      findUnique: vi.fn()
    },
    totalGoal: {
      findUnique: vi.fn()
    }
  }
}));

const dailyDeviceUsageFindUniqueMock = vi.mocked(prisma.dailyDeviceUsage.findUnique);
const totalGoalFindUniqueMock = vi.mocked(prisma.totalGoal.findUnique);

describe('dashboardRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads total phone screen time from daily_device_usage for the date', async () => {
    dailyDeviceUsageFindUniqueMock.mockResolvedValueOnce({ totalUsedMinutes: 90 } as never);

    await expect(
      findDeviceUsedMinutes('user-1', new Date('2026-07-16T00:00:00.000Z'))
    ).resolves.toBe(90);

    expect(dailyDeviceUsageFindUniqueMock).toHaveBeenCalledWith({
      where: { userId_date: { userId: 'user-1', date: new Date('2026-07-16T00:00:00.000Z') } },
      select: { totalUsedMinutes: true }
    });
  });

  it('returns 0 when there is no device usage record for the date', async () => {
    dailyDeviceUsageFindUniqueMock.mockResolvedValueOnce(null as never);

    await expect(
      findDeviceUsedMinutes('user-1', new Date('2026-07-16T00:00:00.000Z'))
    ).resolves.toBe(0);
  });

  it('returns the total goal target minutes when a goal is set', async () => {
    totalGoalFindUniqueMock.mockResolvedValueOnce({ targetMinutes: 120 } as never);

    await expect(findTotalTargetMinutes('user-1')).resolves.toBe(120);
  });

  it('returns null when the user has no total goal', async () => {
    totalGoalFindUniqueMock.mockResolvedValueOnce(null as never);

    await expect(findTotalTargetMinutes('user-1')).resolves.toBeNull();
  });
});
