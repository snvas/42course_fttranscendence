import { MatchEvent } from '../interfaces/match-event.interface';
import { MatchPlayerDto } from './match-player.dto';
import {
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MatchEventDto implements MatchEvent {
  @IsNotEmpty()
  @IsString()
  matchId: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['p1', 'p2'])
  as: 'p1' | 'p2';
  @IsNotEmptyObject()
  @ValidateNested()
  p1: MatchPlayerDto;
  @IsNotEmptyObject()
  @ValidateNested()
  p2: MatchPlayerDto;
}
