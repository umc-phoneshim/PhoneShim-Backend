import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildDailyUsageSummary,
  getTodayInKst
} from '../src/domains/dashboard/domain/dashboardEntity';

describe('getTodayInKst', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current KST date at UTC midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));

    expect(getTodayInKst()).toEqual(new Date('2026-07-16T00:00:00.000Z'));
  });
});

describe('buildDailyUsageSummary', () => {
  it('builds a summary when a target exists', () => {
    expect(
      buildDailyUsageSummary({
        date: new Date('2026-07-16T00:00:00.000Z'),
        usedMinutes: 40,
        targetMinutes: 30
      })
    ).toEqual({
      date: '2026-07-16',
      targetMinutes: 30,
      usedMinutes: 40,
      remainingMinutes: -10,
      isExceeded: true
    });
  });

  it('uses null remaining minutes and false exceeded state when no target exists', () => {
    expect(
      buildDailyUsageSummary({
        date: new Date('2026-07-16T00:00:00.000Z'),
        usedMinutes: 40,
        targetMinutes: null
      })
    ).toEqual({
      date: '2026-07-16',
      targetMinutes: null,
      usedMinutes: 40,
      remainingMinutes: null,
      isExceeded: false
    });
  });
});
