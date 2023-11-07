import { IsNotEmpty, IsNumber } from 'class-validator';
import { MatchPlayer } from '../interfaces/match-player.interface';

export class MatchPlayerDto implements MatchPlayer {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  nickname: string;
  @IsNotEmpty()
  @IsNumber()
  avatarId?: number;
}
