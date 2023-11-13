import { PlayerStatus } from '../../profile/interfaces/player.status.interface';
import { AuthenticatedSocket } from './authenticated-socket.type';

export type PlayerStatusSocket = PlayerStatus & {
  socket: AuthenticatedSocket;
};
