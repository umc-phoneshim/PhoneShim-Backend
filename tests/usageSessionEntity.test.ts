import { describe, expect, it } from 'vitest';

import { createUsageSessionEntity } from '../src/domains/usageSession/domain/usageSessionEntity';

describe('createUsageSessionEntity', () => {
  const base = {
    userId: 'user-1',
    monitoredAppId: 'app-1',
    date: '2026-07-16'
  };

  it('creates a usage session entity with a KST date', () => {
    expect(
      createUsageSessionEntity({
        ...base,
        startTime: '2026-07-16T12:00:00.000Z',
        endTime: '2026-07-16T12:30:00.000Z'
      })
    ).toEqual({
      userId: 'user-1',
      monitoredAppId: 'app-1',
      date: new Date('2026-07-16T00:00:00.000Z'),
      startTime: new Date('2026-07-16T12:00:00.000Z'),
      endTime: new Date('2026-07-16T12:30:00.000Z')
    });
  });

  it('rejects invalid time strings', () => {
    expect(() =>
      createUsageSessionEntity({ ...base, startTime: 'bad', endTime: '2026-07-16T12:30:00.000Z' })
    ).toThrow('startTime must be a valid ISO date string');
  });

  it('rejects a session whose end is not after its start', () => {
    expect(() =>
      createUsageSessionEntity({
        ...base,
        startTime: '2026-07-16T12:30:00.000Z',
        endTime: '2026-07-16T12:30:00.000Z'
      })
    ).toThrow('endTime must be after startTime');
  });
});
