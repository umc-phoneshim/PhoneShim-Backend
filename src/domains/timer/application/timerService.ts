import { createTimer, type CreateTimerPayload } from '../domain/timerEntity';
import * as timerRepository from '../infrastructure/timerRepository';

type StopTimerPayload = {
  timerId?: string | number;
};

export async function startTimer(payload: CreateTimerPayload) {
  const timer = createTimer(payload);

  return timerRepository.save(timer);
}

export async function stopTimer(payload: StopTimerPayload) {
  return {
    timerId: payload.timerId || null,
    stoppedAt: new Date().toISOString()
  };
}
