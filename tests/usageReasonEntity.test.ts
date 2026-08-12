import { describe, expect, it } from 'vitest';

import {
  buildUsageReasonCalendar,
  createUsageReasonEntities,
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

describe('createUsageReasonEntities', () => {
  const base = {
    userId: 'user-1',
    monitoredAppId: 'app-1',
    date: '2026-07-16',
    timeRangeStart: '2026-07-16T12:00:00.000Z',
    timeRangeEnd: '2026-07-16T12:30:00.000Z'
  };

  it('creates one entity per selected reason code', () => {
    expect(createUsageReasonEntities({ ...base, reasonCodes: ['LEISURE', 'HABIT'] })).toEqual([
      {
        userId: 'user-1',
        monitoredAppId: 'app-1',
        usageLogId: null,
        date: new Date('2026-07-16T00:00:00.000Z'),
        timeRangeStart: new Date('2026-07-16T12:00:00.000Z'),
        timeRangeEnd: new Date('2026-07-16T12:30:00.000Z'),
        reason: 'LEISURE'
      },
      {
        userId: 'user-1',
        monitoredAppId: 'app-1',
        usageLogId: null,
        date: new Date('2026-07-16T00:00:00.000Z'),
        timeRangeStart: new Date('2026-07-16T12:00:00.000Z'),
        timeRangeEnd: new Date('2026-07-16T12:30:00.000Z'),
        reason: 'HABIT'
      }
    ]);
  });

  it('removes duplicate reason codes', () => {
    const result = createUsageReasonEntities({ ...base, reasonCodes: ['OTHER', 'OTHER'] });

    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe('OTHER');
  });

  it('rejects an empty reason code list', () => {
    expect(() => createUsageReasonEntities({ ...base, reasonCodes: [] })).toThrow(
      'reasonCodes must include at least one reason'
    );
  });

  it('rejects an unknown reason code', () => {
    expect(() => createUsageReasonEntities({ ...base, reasonCodes: ['LEISURE', 'PARTY'] })).toThrow(
      'reasonCodes must be one of'
    );
  });

  it('rejects invalid time strings', () => {
    expect(() =>
      createUsageReasonEntities({ ...base, timeRangeStart: 'bad', reasonCodes: ['LEISURE'] })
    ).toThrow('timeRangeStart must be a valid ISO date string');
  });

  it('rejects a time range whose end is not after its start', () => {
    expect(() =>
      createUsageReasonEntities({
        ...base,
        timeRangeStart: '2026-07-16T12:30:00.000Z',
        timeRangeEnd: '2026-07-16T12:30:00.000Z',
        reasonCodes: ['LEISURE']
      })
    ).toThrow('timeRangeEnd must be after timeRangeStart');
  });
});

describe('buildUsageReasonCalendar', () => {
  it('marks duplicate reason rows as a single day with reasons', () => {
    const result = buildUsageReasonCalendar(
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-02-28T00:00:00.000Z'),
      [
        { date: new Date('2026-02-02T00:00:00.000Z') },
        { date: new Date('2026-02-02T00:00:00.000Z') }
      ]
    );

    expect(result).toHaveLength(28);
    expect(result[0]).toEqual({ date: '2026-02-01', hasReason: false });
    expect(result[1]).toEqual({ date: '2026-02-02', hasReason: true });
  });
});
