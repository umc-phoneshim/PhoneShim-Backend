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
});
