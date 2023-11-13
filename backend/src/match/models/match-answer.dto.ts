import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { MatchAnswer } from '../interfaces/match-answer.interface';

export class MatchAnswerDto implements MatchAnswer {
  @IsNotEmpty()
  @IsString()
  matchId: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['p1', 'p2'])
  as: 'p1' | 'p2';
}
