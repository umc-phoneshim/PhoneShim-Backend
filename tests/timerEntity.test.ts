import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTimer } from '../src/domains/timer/domain/timerEntity';

describe('createTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a running timer with the current timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T01:02:03.000Z'));

    expect(createTimer({ userId: 'user-1' })).toEqual({
      userId: 'user-1',
      startedAt: '2026-07-16T01:02:03.000Z',
      status: 'running'
    });
  });
});
