import type { NewReminder, Reminder, ValidatedReminderUpdate } from './reminderEntity';

export default interface ReminderRepositoryInterface {
  save(reminder: NewReminder): Promise<Reminder>;
  findAllByUserId(userId: string): Promise<Reminder[]>;
  findById(id: string): Promise<Reminder | null>;
  update(id: string, payload: ValidatedReminderUpdate): Promise<Reminder>;
  deleteById(id: string): Promise<void>;
}
