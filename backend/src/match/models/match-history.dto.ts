import { SimpleProfileDto } from '../../profile/models/simple-profile.dto';
import { MatchHistory } from '../interfaces/match-history.interface';

export class MatchHistoryDto implements MatchHistory {
  matchId: string;
  me: SimpleProfileDto;
  opponent: SimpleProfileDto;
  myScore: number;
  opponentScore: number;
  matchStatus:
    | 'rejected'
    | 'waitingPlayers'
    | 'started'
    | 'finished'
    | 'abandoned';
}
