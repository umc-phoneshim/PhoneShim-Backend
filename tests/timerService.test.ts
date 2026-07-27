import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startTimer, stopTimer } from '../src/domains/timer/application/timerService';
import * as timerRepository from '../src/domains/timer/infrastructure/timerRepository';

vi.mock('../src/domains/timer/infrastructure/timerRepository', () => ({
  save: vi.fn()
}));

const saveMock = vi.mocked(timerRepository.save);

describe('timerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T01:02:03.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts a timer by saving a running timer entity', async () => {
    saveMock.mockImplementationOnce(async (timer) => ({ id: null, ...timer }));

    await startTimer({ userId: 'user-1' });

    expect(saveMock).toHaveBeenCalledWith({
      userId: 'user-1',
      startedAt: '2026-07-16T01:02:03.000Z',
      status: 'running'
    });
  });

  it('stops a timer with the current timestamp', async () => {
    await expect(stopTimer({ timerId: 'timer-1' })).resolves.toEqual({
      timerId: 'timer-1',
      stoppedAt: '2026-07-16T01:02:03.000Z'
    });
  });
});
