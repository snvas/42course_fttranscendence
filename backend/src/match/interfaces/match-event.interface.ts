import { MatchPlayer } from './match-player.interface';

export interface MatchEvent {
  matchId: string;
  as: string;
  p1: MatchPlayer;
  p2: MatchPlayer;
}
