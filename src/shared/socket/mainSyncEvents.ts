import type { Server as SocketServer } from 'socket.io';

import { getUserRoomName, isSocketAuthRequired } from './socketConfig';

export type ReminderMainSyncEvent =
  | 'reminder.created'
  | 'reminder.updated'
  | 'reminder.deleted';

export type ReminderMainSyncPayload = {
  event: ReminderMainSyncEvent;
  reason: 'today-reminder-changed';
  requiresRefetch: true;
};

let socketServer: SocketServer | undefined;

export function setSocketServer(server: SocketServer) {
  socketServer = server;
}

export function emitReminderMainSyncEvent(event: ReminderMainSyncEvent, userId: string) {
  const payload: ReminderMainSyncPayload = {
    event,
    reason: 'today-reminder-changed',
    requiresRefetch: true
  };

  if (isSocketAuthRequired()) {
    socketServer?.to(getUserRoomName(userId)).emit(event, payload);
    return;
  }

  socketServer?.emit(event, payload);
}
