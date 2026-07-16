import { describe, expect, it } from 'vitest';

import { RestrictMode } from '@prisma/client';
import { createReminderEntity } from '../src/domains/reminder/domain/reminderEntity';

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
});
