import { MatchAnswer } from '../interfaces/match-answer.interface';

export class MatchAnswerDto implements MatchAnswer {
  matchId: string;
  as: 'p1' | 'p2';
}
