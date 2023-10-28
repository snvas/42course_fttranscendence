import { AuthenticatedSocket } from '../chat/types/authenticated-socket.type';

export function isAuthenticatedSocket(socket: AuthenticatedSocket): boolean {
  if (
    socket.request.user === undefined ||
    socket.request.user.id === undefined
  ) {
    this.logger.warn(`### User not authenticated: [${socket.id}]`);
    socket.emit('unauthorized', 'User not authenticated');
    socket.disconnect();
    return false;
  }

  return true;
}
