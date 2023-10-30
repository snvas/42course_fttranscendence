import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SimpleProfile } from '../interfaces/simples-profile.interface';

export class SimpleProfileDto implements SimpleProfile {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsNumber()
  avatarId?: number;
}
