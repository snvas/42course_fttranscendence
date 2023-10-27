import { PlayerStatus } from '../../interfaces/player/player.status.interface';
import {
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
  @IsIn(['online', 'playing'])
  status: string;
}
