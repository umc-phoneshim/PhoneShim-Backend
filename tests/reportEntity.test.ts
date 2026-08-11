import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildReasonSummaries,
  buildSuggestion,
  parseReportRange
} from '../src/domains/report/domain/reportEntity';

describe('parseReportRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('computes the day range as a single day', () => {
    expect(parseReportRange('day', '2026-07-16')).toEqual({
      range: 'day',
      from: new Date('2026-07-16T00:00:00.000Z'),
      to: new Date('2026-07-16T00:00:00.000Z')
    });
  });

  it('computes the week range as the last 7 days (inclusive)', () => {
    expect(parseReportRange('week', '2026-07-16')).toEqual({
      range: 'week',
      from: new Date('2026-07-10T00:00:00.000Z'),
      to: new Date('2026-07-16T00:00:00.000Z')
    });
  });

  it('computes the month range as the last 30 days (inclusive)', () => {
    expect(parseReportRange('month', '2026-07-16')).toEqual({
      range: 'month',
      from: new Date('2026-06-17T00:00:00.000Z'),
      to: new Date('2026-07-16T00:00:00.000Z')
    });
  });

  it('uses KST today when no date is given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T15:30:00.000Z'));

    expect(parseReportRange('day').to).toEqual(new Date('2026-07-16T00:00:00.000Z'));
  });

  it('rejects an invalid range', () => {
    expect(() => parseReportRange('year', '2026-07-16')).toThrow('range must be one of');
  });
});

describe('buildReasonSummaries', () => {
  const at = (value: string) => new Date(value);

  it('sums usage minutes per reason, broken down by app, sorted by total', () => {
    const rows = [
      {
        monitoredAppId: 'app-1',
        appName: 'YouTube',
        reason: 'LEISURE',
        timeRangeStart: at('2026-07-16T12:00:00.000Z'),
        timeRangeEnd: at('2026-07-16T12:30:00.000Z')
      },
      {
        monitoredAppId: 'app-2',
        appName: 'KakaoTalk',
        reason: 'LEISURE',
        timeRangeStart: at('2026-07-16T13:00:00.000Z'),
        timeRangeEnd: at('2026-07-16T13:10:00.000Z')
      },
      {
        monitoredAppId: 'app-1',
        appName: 'YouTube',
        reason: 'HABIT',
        timeRangeStart: at('2026-07-16T20:00:00.000Z'),
        timeRangeEnd: at('2026-07-16T20:05:00.000Z')
      }
    ];

    expect(buildReasonSummaries(rows)).toEqual([
      {
        reason: 'LEISURE',
        totalMinutes: 40,
        apps: [
          { monitoredAppId: 'app-1', appName: 'YouTube', minutes: 30 },
          { monitoredAppId: 'app-2', appName: 'KakaoTalk', minutes: 10 }
        ]
      },
      {
        reason: 'HABIT',
        totalMinutes: 5,
        apps: [{ monitoredAppId: 'app-1', appName: 'YouTube', minutes: 5 }]
      }
    ]);
  });

  it('attributes the full block time to each reason on multi-select', () => {
    // 같은 30분 블록(app-1)에 사유 2개 → 각 사유에 30분씩 전체 귀속
    const rows = [
      {
        monitoredAppId: 'app-1',
        appName: 'YouTube',
        reason: 'LEISURE',
        timeRangeStart: at('2026-07-16T12:00:00.000Z'),
        timeRangeEnd: at('2026-07-16T12:30:00.000Z')
      },
      {
        monitoredAppId: 'app-1',
        appName: 'YouTube',
        reason: 'HABIT',
        timeRangeStart: at('2026-07-16T12:00:00.000Z'),
        timeRangeEnd: at('2026-07-16T12:30:00.000Z')
      }
    ];

    const result = buildReasonSummaries(rows);

    expect(result).toHaveLength(2);
    expect(result.every((reasonSummary) => reasonSummary.totalMinutes === 30)).toBe(true);
  });

  it('skips zero-length blocks and returns empty for no rows', () => {
    expect(buildReasonSummaries([])).toEqual([]);
    expect(
      buildReasonSummaries([
        {
          monitoredAppId: 'app-1',
          appName: 'YouTube',
          reason: 'LEISURE',
          timeRangeStart: at('2026-07-16T12:00:00.000Z'),
          timeRangeEnd: at('2026-07-16T12:00:00.000Z')
        }
      ])
    ).toEqual([]);
  });
});

describe('buildSuggestion', () => {
  it('returns NO_GOAL when there is no total goal', () => {
    const result = buildSuggestion({ phoneTotalMinutes: 200, totalTargetMinutes: null, apps: [] });

    expect(result).toMatchObject({ suggestionType: 'NO_GOAL', excessMinutes: 0, appName: null });
  });

  it('returns TOTAL_EXCEEDED with the most-used app when phone total exceeds the goal', () => {
    const result = buildSuggestion({
      phoneTotalMinutes: 190,
      totalTargetMinutes: 120,
      apps: [
        { appName: 'YouTube', usedMinutes: 80, targetMinutes: 60 },
        { appName: 'KakaoTalk', usedMinutes: 20, targetMinutes: null }
      ]
    });

    expect(result).toMatchObject({
      suggestionType: 'TOTAL_EXCEEDED',
      excessMinutes: 70,
      appName: 'YouTube'
    });
    expect(result.message).toContain('70분');
    expect(result.message).toContain('YouTube');
  });

  it('returns TOTAL_EXCEEDED with no app when no monitored app was used', () => {
    const result = buildSuggestion({
      phoneTotalMinutes: 150,
      totalTargetMinutes: 120,
      apps: [{ appName: 'YouTube', usedMinutes: 0, targetMinutes: 60 }]
    });

    expect(result).toMatchObject({
      suggestionType: 'TOTAL_EXCEEDED',
      excessMinutes: 30,
      appName: null
    });
  });

  it('returns APP_EXCEEDED for the most-exceeded app when the total is achieved', () => {
    const result = buildSuggestion({
      phoneTotalMinutes: 100,
      totalTargetMinutes: 120,
      apps: [
        { appName: 'YouTube', usedMinutes: 70, targetMinutes: 60 }, // 10분 초과
        { appName: 'Instagram', usedMinutes: 50, targetMinutes: 20 } // 30분 초과
      ]
    });

    expect(result).toMatchObject({
      suggestionType: 'APP_EXCEEDED',
      excessMinutes: 30,
      appName: 'Instagram'
    });
  });

  it('returns ACHIEVED when the total and every app goal are met', () => {
    const result = buildSuggestion({
      phoneTotalMinutes: 90,
      totalTargetMinutes: 120,
      apps: [{ appName: 'YouTube', usedMinutes: 30, targetMinutes: 60 }]
    });

    expect(result).toMatchObject({ suggestionType: 'ACHIEVED', excessMinutes: 0, appName: null });
  });
});
