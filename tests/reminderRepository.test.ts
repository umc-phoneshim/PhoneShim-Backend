import { describe, expect, it, vi } from 'vitest';

import prisma from '../src/shared/database/prismaClient';
import { existsOverlappingReminder } from '../src/domains/reminder/infrastructure/reminderRepository';

vi.mock('../src/shared/database/prismaClient', () => ({
  default: {
    reminder: {
      count: vi.fn()
    }
  }
}));

const reminderCountMock = vi.mocked(prisma.reminder.count);

describe('existsOverlappingReminder', () => {
  it('uses exclusive time bounds so adjacent reminders are allowed', async () => {
    reminderCountMock.mockResolvedValueOnce(0);

    const date = new Date('2026-07-16T00:00:00.000Z');
    const startTime = new Date('2026-07-16T09:00:00.000Z');
    const endTime = new Date('2026-07-16T10:00:00.000Z');

    const hasOverlap = await existsOverlappingReminder('user-1', date, startTime, endTime);

    expect(hasOverlap).toBe(false);
    expect(reminderCountMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        date,
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      }
    });
  });

  it('excludes the current reminder when checking overlaps during update', async () => {
    reminderCountMock.mockResolvedValueOnce(1);

    const date = new Date('2026-07-16T00:00:00.000Z');
    const startTime = new Date('2026-07-16T09:30:00.000Z');
    const endTime = new Date('2026-07-16T10:30:00.000Z');

    const hasOverlap = await existsOverlappingReminder(
      'user-1',
      date,
      startTime,
      endTime,
      'reminder-1'
    );

    expect(hasOverlap).toBe(true);
    expect(reminderCountMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        date,
        id: { not: 'reminder-1' },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      }
    });
  });
});
