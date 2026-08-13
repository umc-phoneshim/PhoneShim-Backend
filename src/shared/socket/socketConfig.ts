export const isSocketAuthRequired = () => process.env.SOCKET_AUTH_REQUIRED === 'true';

export const getUserRoomName = (userId: string) => `user:${userId}`;
