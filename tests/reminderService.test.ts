import { RestrictMode } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as reminderRepository from '../src/domains/reminder/infrastructure/reminderRepository';
import {
  createReminder,
  deleteReminder,
  getReminderById,
  getReminders,
  updateReminder
} from '../src/domains/reminder/application/reminderService';
import type { Reminder } from '../src/domains/reminder/domain/reminderEntity';
import * as mainSyncEvents from '../src/shared/socket/mainSyncEvents';

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

vi.mock('../src/shared/socket/mainSyncEvents', () => ({
  emitReminderMainSyncEvent: vi.fn()
}));

const countOwnedMonitoredAppsMock = vi.mocked(reminderRepository.countOwnedMonitoredApps);
const deleteByIdAndUserIdMock = vi.mocked(reminderRepository.deleteByIdAndUserId);
const existsOverlappingReminderMock = vi.mocked(reminderRepository.existsOverlappingReminder);
const findAllByUserIdAndDateMock = vi.mocked(reminderRepository.findAllByUserIdAndDate);
const findByIdAndUserIdMock = vi.mocked(reminderRepository.findByIdAndUserId);
const saveMock = vi.mocked(reminderRepository.save);
const updateMock = vi.mocked(reminderRepository.update);
const emitReminderMainSyncEventMock = vi.mocked(mainSyncEvents.emitReminderMainSyncEvent);

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

  it('rejects creating a SPECIFIC_APP reminder with app ids the user does not own', async () => {
    countOwnedMonitoredAppsMock.mockResolvedValueOnce(1);

    await expect(
      createReminder({
        userId: 'user-1',
        date: '2026-07-16',
        title: 'study',
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: '2026-07-16T10:00:00.000Z',
        restrictMode: RestrictMode.SPECIFIC_APP,
        restrictedAppIds: ['app-1', 'other-user-app']
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_RESTRICTED_APP_IDS'
    });

    expect(existsOverlappingReminderMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('creates a SPECIFIC_APP reminder with app ids owned by the user', async () => {
    countOwnedMonitoredAppsMock.mockResolvedValueOnce(2);
    existsOverlappingReminderMock.mockResolvedValueOnce(false);
    saveMock.mockImplementationOnce(async (reminder) => ({
      ...reminder,
      id: 'reminder-4',
      createdAt: new Date('2026-07-15T00:00:00.000Z'),
      updatedAt: new Date('2026-07-15T00:00:00.000Z')
    }));

    await createReminder({
      userId: 'user-1',
      date: '2026-07-16',
      title: 'study',
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z',
      restrictMode: RestrictMode.SPECIFIC_APP,
      restrictedAppIds: ['app-1', 'app-2']
    });

    expect(countOwnedMonitoredAppsMock).toHaveBeenCalledWith('user-1', ['app-1', 'app-2']);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('clears restricted app ids when updating to FULL_PHONE mode', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce({
      ...existingReminder,
      restrictMode: RestrictMode.SPECIFIC_APP,
      restrictedAppIds: ['app-1']
    });
    existsOverlappingReminderMock.mockResolvedValueOnce(false);
    updateMock.mockImplementationOnce(async (_id, _userId, payload) => ({
      ...existingReminder,
      ...payload,
      restrictMode: payload.restrictMode ?? existingReminder.restrictMode,
      restrictedAppIds: payload.restrictedAppIds ?? existingReminder.restrictedAppIds,
      updatedAt: new Date('2026-07-15T01:00:00.000Z')
    }));

    await updateReminder('reminder-1', 'user-1', {
      restrictMode: RestrictMode.FULL_PHONE
    });

    expect(updateMock).toHaveBeenCalledWith(
      'reminder-1',
      'user-1',
      expect.objectContaining({
        restrictMode: RestrictMode.FULL_PHONE,
        restrictedAppIds: []
      })
    );
  });

  it('rejects updating to SPECIFIC_APP mode with app ids the user does not own', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);
    countOwnedMonitoredAppsMock.mockResolvedValueOnce(0);

    await expect(
      updateReminder('reminder-1', 'user-1', {
        restrictMode: RestrictMode.SPECIFIC_APP,
        restrictedAppIds: ['other-user-app']
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_RESTRICTED_APP_IDS'
    });

    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe('reminderService CRUD operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    countOwnedMonitoredAppsMock.mockResolvedValue(0);
    existsOverlappingReminderMock.mockResolvedValue(false);
  });

  it('gets reminders by user id and selected date', async () => {
    findAllByUserIdAndDateMock.mockResolvedValueOnce([existingReminder]);

    const reminders = await getReminders('user-1', '2026-07-16');

    expect(reminders).toEqual([existingReminder]);
    expect(findAllByUserIdAndDateMock).toHaveBeenCalledWith(
      'user-1',
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('uses the current KST date when no date is provided', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));
    findAllByUserIdAndDateMock.mockResolvedValueOnce([existingReminder]);

    try {
      await getReminders('user-1');

      expect(findAllByUserIdAndDateMock).toHaveBeenCalledWith(
        'user-1',
        new Date('2026-07-16T00:00:00.000Z')
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('gets a reminder by id and user id', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);

    const reminder = await getReminderById('reminder-1', 'user-1');

    expect(reminder).toBe(existingReminder);
    expect(findByIdAndUserIdMock).toHaveBeenCalledWith('reminder-1', 'user-1');
  });

  it('rejects getting a reminder when it does not exist or is not owned by the user', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(getReminderById('reminder-1', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'REMINDER_NOT_FOUND'
    });
  });

  it('merges existing and requested values when updating a reminder', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);
    updateMock.mockImplementationOnce(async (_id, _userId, payload) => ({
      ...existingReminder,
      ...payload,
      updatedAt: new Date('2026-07-15T01:00:00.000Z')
    }));

    await updateReminder('reminder-1', 'user-1', {
      title: 'updated focus'
    });

    expect(existsOverlappingReminderMock).toHaveBeenCalledWith(
      'user-1',
      existingReminder.date,
      existingReminder.startTime,
      existingReminder.endTime,
      'reminder-1'
    );
    expect(updateMock).toHaveBeenCalledWith(
      'reminder-1',
      'user-1',
      expect.objectContaining({
        title: 'updated focus',
        restrictedAppIds: []
      })
    );
  });

  it('checks ownership before deleting a reminder', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);
    deleteByIdAndUserIdMock.mockResolvedValueOnce(undefined);

    await deleteReminder('reminder-1', 'user-1');

    expect(findByIdAndUserIdMock).toHaveBeenCalledWith('reminder-1', 'user-1');
    expect(deleteByIdAndUserIdMock).toHaveBeenCalledWith('reminder-1', 'user-1');
  });

  it('rejects deleting a reminder when it does not exist or is not owned by the user', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(null);

    await expect(deleteReminder('reminder-1', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'REMINDER_NOT_FOUND'
    });
    expect(deleteByIdAndUserIdMock).not.toHaveBeenCalled();
  });
});

describe('reminderService MAIN105 sync events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T01:00:00.000Z'));
    countOwnedMonitoredAppsMock.mockResolvedValue(0);
    existsOverlappingReminderMock.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits a created event when a reminder is created for today in KST', async () => {
    saveMock.mockImplementationOnce(async (reminder) => ({
      ...reminder,
      id: 'reminder-2',
      createdAt: new Date('2026-07-16T01:00:00.000Z'),
      updatedAt: new Date('2026-07-16T01:00:00.000Z')
    }));

    await createReminder({
      userId: 'user-1',
      date: '2026-07-16',
      title: 'study',
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z'
    });

    expect(emitReminderMainSyncEventMock).toHaveBeenCalledWith('reminder.created');
  });

  it('does not emit a created event when a reminder is created for another date', async () => {
    saveMock.mockImplementationOnce(async (reminder) => ({
      ...reminder,
      id: 'reminder-3',
      createdAt: new Date('2026-07-16T01:00:00.000Z'),
      updatedAt: new Date('2026-07-16T01:00:00.000Z')
    }));

    await createReminder({
      userId: 'user-1',
      date: '2026-07-17',
      title: 'study',
      startTime: '2026-07-17T09:00:00.000Z',
      endTime: '2026-07-17T10:00:00.000Z'
    });

    expect(emitReminderMainSyncEventMock).not.toHaveBeenCalled();
  });

  it('emits an updated event when a reminder moves away from today in KST', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);
    updateMock.mockImplementationOnce(async (_id, _userId, payload) => ({
      ...existingReminder,
      ...payload,
      updatedAt: new Date('2026-07-16T01:00:00.000Z')
    }));

    await updateReminder('reminder-1', 'user-1', {
      date: '2026-07-17',
      startTime: '2026-07-17T09:00:00.000Z',
      endTime: '2026-07-17T10:00:00.000Z'
    });

    expect(emitReminderMainSyncEventMock).toHaveBeenCalledWith('reminder.updated');
  });

  it('emits a deleted event when a reminder is deleted for today in KST', async () => {
    findByIdAndUserIdMock.mockResolvedValueOnce(existingReminder);
    deleteByIdAndUserIdMock.mockResolvedValueOnce(undefined);

    await deleteReminder('reminder-1', 'user-1');

    expect(emitReminderMainSyncEventMock).toHaveBeenCalledWith('reminder.deleted');
  });
});
