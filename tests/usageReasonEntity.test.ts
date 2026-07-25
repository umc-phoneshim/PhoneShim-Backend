import { describe, expect, it } from 'vitest';

import {
  createUsageReasonEntity,
  isWithinReasonWindow
} from '../src/domains/usageReason/domain/usageReasonEntity';

describe('isWithinReasonWindow', () => {
  const dateOnly = new Date('2026-07-16T00:00:00.000Z');

  it('allows the configured KST reason input window inclusively', () => {
    expect(isWithinReasonWindow(dateOnly, new Date('2026-07-16T13:00:00.000Z'))).toBe(true);
    expect(isWithinReasonWindow(dateOnly, new Date('2026-07-17T01:00:00.000Z'))).toBe(true);
  });

  it('rejects times outside the reason input window', () => {
    expect(isWithinReasonWindow(dateOnly, new Date('2026-07-16T12:59:59.999Z'))).toBe(false);
    expect(isWithinReasonWindow(dateOnly, new Date('2026-07-17T01:00:00.001Z'))).toBe(false);
  });
});

describe('createUsageReasonEntity', () => {
  it('creates a usage reason with normalized reason and optional usageLogId', () => {
    expect(
      createUsageReasonEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        timeRangeStart: '2026-07-16T12:00:00.000Z',
        timeRangeEnd: '2026-07-16T12:30:00.000Z',
        reason: '  needed it  '
      })
    ).toEqual({
      userId: 'user-1',
      monitoredAppId: 'app-1',
      usageLogId: null,
      date: new Date('2026-07-16T00:00:00.000Z'),
      timeRangeStart: new Date('2026-07-16T12:00:00.000Z'),
      timeRangeEnd: new Date('2026-07-16T12:30:00.000Z'),
      reason: 'needed it'
    });
  });

  it('rejects invalid time strings', () => {
    expect(() =>
      createUsageReasonEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        timeRangeStart: 'bad',
        timeRangeEnd: '2026-07-16T12:30:00.000Z',
        reason: 'needed it'
      })
    ).toThrow('timeRangeStart must be a valid ISO date string');
  });

  it('rejects a time range whose end is not after its start', () => {
    expect(() =>
      createUsageReasonEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        timeRangeStart: '2026-07-16T12:30:00.000Z',
        timeRangeEnd: '2026-07-16T12:30:00.000Z',
        reason: 'needed it'
      })
    ).toThrow('timeRangeEnd must be after timeRangeStart');
  });

  it('rejects blank and too-long reasons', () => {
    expect(() =>
      createUsageReasonEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        timeRangeStart: '2026-07-16T12:00:00.000Z',
        timeRangeEnd: '2026-07-16T12:30:00.000Z',
        reason: ' '
      })
    ).toThrow('reason is required');

    expect(() =>
      createUsageReasonEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        timeRangeStart: '2026-07-16T12:00:00.000Z',
        timeRangeEnd: '2026-07-16T12:30:00.000Z',
        reason: '가'.repeat(101)
      })
    ).toThrow('reason must be 100 characters or fewer');
  });
});
