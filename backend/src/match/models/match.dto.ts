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
import { Match } from '../interfaces/match.interface';

export class MatchDto implements Match {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['waitingPlayers', 'started', 'finished', 'rejected', 'abandoned'])
  status: 'waitingPlayers' | 'started' | 'finished' | 'rejected' | 'abandoned';
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
  @IsIn(['p1', 'p2'])
  winner?: 'p1' | 'p2';
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;
}
