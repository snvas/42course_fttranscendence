import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { MatchUpdated } from '../interfaces/match-updated.interface';

export class MatchUpdatedDto implements MatchUpdated {
  @IsBoolean()
  @IsNotEmpty()
  updated: boolean;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  affected: number;
  @IsBoolean()
  @IsNotEmpty()
  matchStarted: boolean;
}
