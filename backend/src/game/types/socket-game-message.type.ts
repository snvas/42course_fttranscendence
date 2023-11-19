import { Positions } from './positions.type';

export type SocketGameMessage = {
  player1: Positions;
  player2: Positions;
  ball: Positions;
};
