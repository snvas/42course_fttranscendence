import { GroupProfile } from '../interfaces/group-profile.interface';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class GroupProfileDto implements GroupProfile {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  @IsString()
  nickname: string;
  @IsNumber()
  @IsNotEmpty()
  avatarId: number;
  @IsNotEmpty()
  @IsString()
  @IsIn(['user', 'admin', 'owner'])
  role: string;
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
  @IsNotEmpty()
  @IsBoolean()
  isMuted: boolean;
}
