import { PlayerStatus } from '../../interfaces/player/player.status.interface';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PlayerStatusDto implements PlayerStatus {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsString()
  nickname: string;
  @IsOptional()
  @IsNumber()
  avatarId?: number;
  @IsNotEmpty()
  @IsString()
  @IsIn(['offline', 'online', 'waiting_match', 'waiting_game', 'playing'])
  status: string;
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;
}
