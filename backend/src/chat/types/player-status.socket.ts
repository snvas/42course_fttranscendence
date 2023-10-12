import { PlayerStatus } from '../interfaces/player.status.interface';
import { AuthenticatedSocket } from './authenticated-socket.type';

export type PlayerStatusSocket = PlayerStatus & {
  socket: AuthenticatedSocket;
};
