import type { Timer } from './timerEntity';

export default interface TimerRepositoryInterface {
  save(timer: Timer): Promise<Timer & { id: string | number | null }>;
  findById(timerId: string | number): Promise<Timer | null>;
}
