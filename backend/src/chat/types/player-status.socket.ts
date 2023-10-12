import { PlayerStatus } from '../interfaces/player.status.interface';
import { AuthenticatedSocketType } from './authenticated.socket.type';

export type PlayerStatusSocket = PlayerStatus & {
  socket: AuthenticatedSocketType;
};
