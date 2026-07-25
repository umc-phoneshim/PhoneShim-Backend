import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createUsageLogEntity,
  formatDateOnly,
  getKstDateOnly
} from '../src/domains/usageLog/domain/usageLogEntity';

describe('getKstDateOnly', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses today in KST when no date is provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));

    expect(getKstDateOnly()).toEqual(new Date('2026-07-16T00:00:00.000Z'));
  });

  it('converts an input timestamp to its KST date only', () => {
    expect(getKstDateOnly('2026-07-15T14:59:00.000Z')).toEqual(
      new Date('2026-07-15T00:00:00.000Z')
    );
    expect(getKstDateOnly('2026-07-15T15:00:00.000Z')).toEqual(
      new Date('2026-07-16T00:00:00.000Z')
    );
  });

  it('rejects an invalid date', () => {
    expect(() => getKstDateOnly('not-a-date')).toThrow('date must be a valid date');
  });
});

describe('formatDateOnly', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDateOnly(new Date('2026-07-16T12:34:56.000Z'))).toBe('2026-07-16');
  });
});

describe('createUsageLogEntity', () => {
  it('creates a valid usage log entity', () => {
    expect(
      createUsageLogEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        date: '2026-07-16',
        usedMinutes: 30,
        entryCount: 2
      })
    ).toEqual({
      userId: 'user-1',
      monitoredAppId: 'app-1',
      date: new Date('2026-07-16T00:00:00.000Z'),
      usedMinutes: 30,
      entryCount: 2
    });
  });

  it('rejects blank ids', () => {
    expect(() =>
      createUsageLogEntity({
        userId: ' ',
        monitoredAppId: 'app-1',
        usedMinutes: 0,
        entryCount: 0
      })
    ).toThrow('userId is required');

    expect(() =>
      createUsageLogEntity({
        userId: 'user-1',
        monitoredAppId: ' ',
        usedMinutes: 0,
        entryCount: 0
      })
    ).toThrow('monitoredAppId is required');
  });

  it('rejects non-negative integer violations', () => {
    expect(() =>
      createUsageLogEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        usedMinutes: -1,
        entryCount: 0
      })
    ).toThrow('usedMinutes must be a non-negative integer');

    expect(() =>
      createUsageLogEntity({
        userId: 'user-1',
        monitoredAppId: 'app-1',
        usedMinutes: 0,
        entryCount: 1.5
      })
    ).toThrow('entryCount must be a non-negative integer');
  });
});
