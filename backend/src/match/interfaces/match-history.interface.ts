import { SimpleProfile } from '../../profile/interfaces/simples-profile.interface';

export interface MatchHistory {
  matchId: string;
  me: SimpleProfile;
  opponent: SimpleProfile;
  myScore: number;
  opponentScore: number;
  winner: 'me' | 'opponent';
  matchStatus:
    | 'rejected'
    | 'waitingPlayers'
    | 'started'
    | 'finished'
    | 'abandoned';
}
