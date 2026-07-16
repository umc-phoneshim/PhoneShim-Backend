import { RestrictMode } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as reminderRepository from '../src/domains/reminder/infrastructure/reminderRepository';
import { createReminder, updateReminder } from '../src/domains/reminder/application/reminderService';
import type { Reminder } from '../src/domains/reminder/domain/reminderEntity';

vi.mock('../src/domains/reminder/infrastructure/reminderRepository', () => ({
  RECORD_NOT_FOUND_ERROR: 'P2025',
  countOwnedMonitoredApps: vi.fn(),
  deleteByIdAndUserId: vi.fn(),
  existsOverlappingReminder: vi.fn(),
  findAllByUserIdAndDate: vi.fn(),
  findByIdAndUserId: vi.fn(),
  isPrismaKnownError: vi.fn(),
  save: vi.fn(),
  update: vi.fn()
}));

const countOwnedMonitoredAppsMock = vi.mocked(reminderRepository.countOwnedMonitoredApps);
const existsOverlappingReminderMock = vi.mocked(reminderRepository.existsOverlappingReminder);
const findByIdAndUserIdMock = vi.mocked(reminderRepository.findByIdAndUserId);
const saveMock = vi.mocked(reminderRepository.save);
const updateMock = vi.mocked(reminderRepository.update);

const existingReminder: Reminder = {
  id: 'reminder-1',
  userId: 'user-1',
  date: new Date('2026-07-16T00:00:00.000Z'),
  title: 'focus',
  startTime: new Date('2026-07-16T09:00:00.000Z'),
  endTime: new Date('2026-07-16T10:00:00.000Z'),
  restrictMode: RestrictMode.NONE,
  restrictedAppIds: [],
  createdAt: new Date('2026-07-15T00:00:00.000Z'),
  updatedAt: new Date('2026-07-15T00:00:00.000Z')
};

describe('reminderService overlap validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    countOwnedMonitoredAppsMock.mockResolvedValue(0);
  });

  it('rejects creating a reminder when the time range overlaps another reminder on the same date', async () => {
    existsOverlappingReminderMock.mockResolvedValueOnce(true);

    await expect(
      createReminder({
        userId: 'user-1',
        date: '2026-07-16',
        title: 'study',
        startTime: '2026-07-16T09:30:00.000Z',
        endTime: '2026-07-16T10:30:00.000Z'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'REMINDER_TIME_OVERLAP'
    });

    expect(saveMock).not.toHaveBeenCalled();
  });

  it('creates a reminder when an adjacent time range does not overlap', async () => {
    existsOverlappingReminderMock.mockResolvedValueOnce(false);
    saveMock.mockImplementationOnce(async (reminder) => ({
      ...reminder,
      id: 'reminder-2',
      createdAt: new Date('2026-07-15T00:00:00.000Z'),
      updatedAt: new Date('2026-07-15T00:00:00.000Z')
    }));

    await createReminder({
      userId: 'user-1',
      date: '2026-07-16',
      title: 'study',
      startTime: '2026-07-16T10:00:00.000Z',
      endTime: '2026-07-16T11:00:00.000Z'
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('allows the same time range on a different date when no overlap is found', async () => {
    existsOverlappingReminderMock.mockResolvedValueOnce(false);
    saveMock.mockImplementationOnce(async (reminder) => ({
      ...reminder,
      id: 'reminder-3',
      createdAt: new Date('2026-07-15T00:00:00.000Z'),
      updatedAt: new Date('2026-07-15T00:00:00.000Z')
    }));

    await createReminder({
      userId: 'user-1',
      date: '2026-07-17',
      title: 'study',
      startTime: '2026-07-17T09:00:00.000Z',
      endTime: '2026-07-17T10:00:00.000Z'
    });

    expect(existsOverlappingReminderMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-17T00:00:00.000Z'),
      new Date('2026-07-17T09:00:00.000Z'),
      new Date('2026-07-17T10:00:00.000Z'),
      undefined
    );
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('rejects updating a reminder when the resolved time range overlaps another reminder', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);
    existsOverlappingReminderMock.mockResolvedValueOnce(true);

    await expect(
      updateReminder('reminder-1', 'user-1', {
        startTime: '2026-07-16T09:30:00.000Z',
        endTime: '2026-07-16T10:30:00.000Z'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'REMINDER_TIME_OVERLAP'
    });

    expect(existsOverlappingReminderMock).toHaveBeenCalledWith(
      'user-1',
      existingReminder.date,
      new Date('2026-07-16T09:30:00.000Z'),
      new Date('2026-07-16T10:30:00.000Z'),
      'reminder-1'
    );
    expect(updateMock).not.toHaveBeenCalled();
  });
});
