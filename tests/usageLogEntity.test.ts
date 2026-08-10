import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildAchievedDates,
  createUsageLogEntity,
  formatDateOnly,
  getKstDateOnly,
  parseMonthRange
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

describe('parseMonthRange', () => {
  it('returns the first and last day of the month in UTC', () => {
    expect(parseMonthRange('2026-07')).toEqual({
      start: new Date('2026-07-01T00:00:00.000Z'),
      end: new Date('2026-07-31T00:00:00.000Z')
    });
  });

  it('handles the last day of February', () => {
    expect(parseMonthRange('2026-02')).toEqual({
      start: new Date('2026-02-01T00:00:00.000Z'),
      end: new Date('2026-02-28T00:00:00.000Z')
    });
  });

  it('rejects an invalid format', () => {
    expect(() => parseMonthRange('2026-7')).toThrow('month must be in YYYY-MM format');
    expect(() => parseMonthRange('not-a-month')).toThrow('month must be in YYYY-MM format');
  });

  it('rejects an out-of-range month', () => {
    expect(() => parseMonthRange('2026-13')).toThrow('month must be a valid month');
    expect(() => parseMonthRange('2026-00')).toThrow('month must be a valid month');
  });
});

describe('buildAchievedDates', () => {
  const day = (date: string) => new Date(`${date}T00:00:00.000Z`);

  it('marks a day achieved when phone screen time is within the goal and no app exceeds its goal', () => {
    const deviceUsages = [{ date: day('2026-07-01'), totalUsedMinutes: 100 }];
    const logs = [{ monitoredAppId: 'app-1', date: day('2026-07-01'), usedMinutes: 30 }];

    expect(buildAchievedDates(deviceUsages, logs, 120, new Map([['app-1', 60]]))).toEqual([
      '2026-07-01'
    ]);
  });

  it('judges by total phone screen time, not by the sum of monitored apps', () => {
    // 주의앱 합계는 30분(목표 이하)이지만 폰 전체는 200분(목표 초과) → 달성 아님
    const deviceUsages = [{ date: day('2026-07-01'), totalUsedMinutes: 200 }];
    const logs = [{ monitoredAppId: 'app-1', date: day('2026-07-01'), usedMinutes: 30 }];

    expect(buildAchievedDates(deviceUsages, logs, 120, new Map([['app-1', 60]]))).toEqual([]);
  });

  it('does not mark a day achieved when a monitored app exceeds its own goal', () => {
    const deviceUsages = [{ date: day('2026-07-01'), totalUsedMinutes: 100 }];
    const logs = [{ monitoredAppId: 'app-1', date: day('2026-07-01'), usedMinutes: 70 }];

    expect(buildAchievedDates(deviceUsages, logs, 120, new Map([['app-1', 60]]))).toEqual([]);
  });

  it('marks a day achieved when phone time is within the goal and there are no monitored logs', () => {
    const deviceUsages = [{ date: day('2026-07-02'), totalUsedMinutes: 50 }];

    expect(buildAchievedDates(deviceUsages, [], 120, new Map())).toEqual(['2026-07-02']);
  });

  it('ignores days without a device usage record even if monitored logs exist', () => {
    // 로그는 있지만 폰 전체 사용량 기록이 없는 날 → 판정 불가 → 달성 아님
    const logs = [{ monitoredAppId: 'app-1', date: day('2026-07-03'), usedMinutes: 10 }];

    expect(buildAchievedDates([], logs, 120, new Map([['app-1', 60]]))).toEqual([]);
  });

  it('returns achieved dates sorted', () => {
    const deviceUsages = [
      { date: day('2026-07-10'), totalUsedMinutes: 50 },
      { date: day('2026-07-02'), totalUsedMinutes: 50 }
    ];

    expect(buildAchievedDates(deviceUsages, [], 120, new Map())).toEqual([
      '2026-07-02',
      '2026-07-10'
    ]);
  });
});
