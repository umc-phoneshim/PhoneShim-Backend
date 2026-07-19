import type { Server as SocketServer } from 'socket.io';

let socketServer: SocketServer | undefined;

export type ReminderMainSyncEvent =
  | 'reminder.created'
  | 'reminder.updated'
  | 'reminder.deleted';

export type ReminderMainSyncPayload = {
  event: ReminderMainSyncEvent;
  reason: 'today-reminder-changed';
  requiresRefetch: true;
};

export function setSocketServer(server: SocketServer) {
  socketServer = server;
}

export function emitReminderMainSyncEvent(event: ReminderMainSyncEvent) {
  const payload: ReminderMainSyncPayload = {
    event,
    reason: 'today-reminder-changed',
    requiresRefetch: true
  };

  socketServer?.emit(event, payload);
}
