import { PlayerStatus } from '../interfaces/player.status.interface';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlayerStatusDto implements PlayerStatus {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsString()
  nickname: string;
  @IsNotEmpty()
  @IsString()
  @IsIn(['online', 'playing'])
  status: string;
}
