import { describe, expect, it } from 'vitest';

import {
  createUsageSessionEntity,
  hasOverlappingSession
} from '../src/domains/usageSession/domain/usageSessionEntity';

describe('createUsageSessionEntity', () => {
  const base = {
    userId: 'user-1',
    monitoredAppId: 'app-1'
  };

  it('derives the KST date from startTime', () => {
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

  it('derives the date in KST for a late-night start (crosses to the next KST day)', () => {
    const entity = createUsageSessionEntity({
      ...base,
      startTime: '2026-07-16T15:30:00.000Z',
      endTime: '2026-07-16T16:00:00.000Z'
    });

    expect(entity.date).toEqual(new Date('2026-07-17T00:00:00.000Z'));
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

describe('hasOverlappingSession', () => {
  const existing = [
    {
      startTime: new Date('2026-07-16T12:00:00.000Z'),
      endTime: new Date('2026-07-16T13:00:00.000Z')
    }
  ];

  it('returns true when the new range overlaps an existing session', () => {
    expect(
      hasOverlappingSession(
        new Date('2026-07-16T12:30:00.000Z'),
        new Date('2026-07-16T13:30:00.000Z'),
        existing
      )
    ).toBe(true);
  });

  it('returns false when ranges only touch at the boundary', () => {
    expect(
      hasOverlappingSession(
        new Date('2026-07-16T13:00:00.000Z'),
        new Date('2026-07-16T14:00:00.000Z'),
        existing
      )
    ).toBe(false);
  });

  it('returns false when there is no existing session', () => {
    expect(
      hasOverlappingSession(
        new Date('2026-07-16T12:00:00.000Z'),
        new Date('2026-07-16T12:30:00.000Z'),
        []
      )
    ).toBe(false);
  });
});
