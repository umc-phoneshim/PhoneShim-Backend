import type { Timer } from '../domain/timerEntity';

export async function save(timer: Timer) {
  return {
    id: null,
    ...timer
  };
}

export async function findById(_timerId: string | number): Promise<Timer | null> {
  return null;
}
