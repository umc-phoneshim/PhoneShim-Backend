import { describe, expect, it } from 'vitest';

import { RestrictMode } from '@prisma/client';
import {
  createReminderEntity,
  createReminderUpdate
} from '../src/domains/reminder/domain/reminderEntity';

describe('createReminderEntity', () => {
  it('creates a valid reminder entity', () => {
    const reminder = createReminderEntity({
      userId: 'user-1',
      date: '2026-07-16',
      title: '독서',
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z'
    });

    expect(reminder).toMatchObject({
      userId: 'user-1',
      title: '독서',
      restrictMode: RestrictMode.NONE,
      restrictedAppIds: []
    });
  });

  it('allows a title with up to 20 characters including spaces', () => {
    const title = '가'.repeat(19) + ' ';

    const reminder = createReminderEntity({
      userId: 'user-1',
      date: '2026-07-16',
      title,
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z'
    });

    expect(reminder.title).toBe(title.trim());
  });

  it('rejects a title longer than 20 characters', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '가'.repeat(21),
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: '2026-07-16T10:00:00.000Z'
      })
    ).toThrow('title must be 20 characters or fewer');
  });

  it('rejects an updated title longer than 20 characters', () => {
    expect(() => createReminderUpdate({ title: '가'.repeat(21) })).toThrow(
      'title must be 20 characters or fewer'
    );
  });

  it('rejects a blank title', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '   ',
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: '2026-07-16T10:00:00.000Z'
      })
    ).toThrow('title is required');
  });

  it('rejects an invalid start time', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '독서',
        startTime: '',
        endTime: '2026-07-16T10:00:00.000Z'
      })
    ).toThrow('startTime must be an ISO datetime with timezone');
  });

  it('rejects a date that is not YYYY-MM-DD', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026/07/16',
        title: '공부',
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: '2026-07-16T10:00:00.000Z'
      })
    ).toThrow('date must be YYYY-MM-DD');
  });

  it('rejects a nonexistent calendar date', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-02-31',
        title: '공부',
        startTime: '2026-02-28T09:00:00.000Z',
        endTime: '2026-02-28T10:00:00.000Z'
      })
    ).toThrow('date must be a valid calendar date');
  });

  it('rejects a datetime without timezone', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '공부',
        startTime: '2026-07-16T09:00:00',
        endTime: '2026-07-16T10:00:00.000Z'
      })
    ).toThrow('startTime must be an ISO datetime with timezone');
  });

  it('rejects times that do not match the selected KST date', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '공부',
        startTime: '2026-07-15T14:59:00.000Z',
        endTime: '2026-07-15T15:30:00.000Z'
      })
    ).toThrow('startTime and endTime must match date');
  });

  it('rejects an invalid end time', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '독서',
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: ''
      })
    ).toThrow('endTime must be an ISO datetime with timezone');
  });

  it('rejects a reminder shorter than one minute', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '독서',
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: '2026-07-16T09:00:59.999Z'
      })
    ).toThrow('Invalid reminder time range');
  });

  it('rejects a time range whose end is before its start', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: '독서',
        startTime: '2026-07-16T10:00:00.000Z',
        endTime: '2026-07-16T09:00:00.000Z'
      })
    ).toThrow('Invalid reminder time range');
  });

  it('rejects SPECIFIC_APP mode without restricted app ids', () => {
    expect(() =>
      createReminderEntity({
        userId: 'user-1',
        date: '2026-07-16',
        title: 'focus',
        startTime: '2026-07-16T09:00:00.000Z',
        endTime: '2026-07-16T10:00:00.000Z',
        restrictMode: RestrictMode.SPECIFIC_APP
      })
    ).toThrow('SPECIFIC_APP requires restrictedAppIds');
  });

  it('keeps restricted app ids only for SPECIFIC_APP mode', () => {
    const reminder = createReminderEntity({
      userId: 'user-1',
      date: '2026-07-16',
      title: 'focus',
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z',
      restrictMode: RestrictMode.SPECIFIC_APP,
      restrictedAppIds: ['app-1', 'app-1', 'app-2']
    });

    expect(reminder.restrictedAppIds).toEqual(['app-1', 'app-2']);
  });

  it('clears restricted app ids for NONE mode', () => {
    const reminder = createReminderEntity({
      userId: 'user-1',
      date: '2026-07-16',
      title: 'focus',
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z',
      restrictMode: RestrictMode.NONE,
      restrictedAppIds: ['app-1']
    });

    expect(reminder.restrictedAppIds).toEqual([]);
  });

  it('clears restricted app ids for FULL_PHONE mode', () => {
    const reminder = createReminderEntity({
      userId: 'user-1',
      date: '2026-07-16',
      title: 'focus',
      startTime: '2026-07-16T09:00:00.000Z',
      endTime: '2026-07-16T10:00:00.000Z',
      restrictMode: RestrictMode.FULL_PHONE,
      restrictedAppIds: ['app-1']
    });

    expect(reminder.restrictedAppIds).toEqual([]);
  });
});
