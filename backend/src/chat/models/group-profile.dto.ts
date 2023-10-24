import { GroupProfile } from '../interfaces/group-profile.interface';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';

export class GroupProfileDto implements GroupProfile {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @ValidateNested()
  @IsNotEmpty()
  profile: MessageProfileDto;
  @IsNotEmpty()
  @IsString()
  @IsIn(['user', 'admin', 'owner'])
  role: string;
  @IsNotEmpty()
  @IsBoolean()
  isMuted: boolean;
}
