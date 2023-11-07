import { MatchPlayer } from './match-player.interface';

export interface MatchEvent {
  as: string;
  p1: MatchPlayer;
  p2: MatchPlayer;
}
