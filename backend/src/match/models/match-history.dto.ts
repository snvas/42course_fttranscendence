import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SimpleProfileDto } from '../../profile/models/simple-profile.dto';
import { MatchHistory } from '../interfaces/match-history.interface';

export class MatchHistoryDto implements MatchHistory {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['waitingPlayers', 'onGoing', 'finished', 'canceled', 'abandoned'])
  status: 'waitingPlayers' | 'onGoing' | 'finished' | 'canceled' | 'abandoned';
  @IsNotEmptyObject()
  @ValidateNested()
  p1: SimpleProfileDto;
  @IsNotEmptyObject()
  @ValidateNested()
  p2: SimpleProfileDto;
  @IsNotEmpty()
  @IsBoolean()
  p1Joined: boolean;
  @IsNotEmpty()
  @IsBoolean()
  p2Joined: boolean;
  @IsNotEmpty()
  @IsNumber()
  p1Score: number;
  @IsNotEmpty()
  @IsNumber()
  p2Score: number;
  @IsNotEmpty()
  @IsString()
  @IsIn(['p1', 'p2', 'draw'])
  winner: 'p1' | 'p2' | 'draw';
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;
}
