import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';
import { GroupChatDto } from './group-chat.dto';

export class GroupMemberDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  role: string;
  @IsBoolean()
  @IsNotEmpty()
  isMuted: boolean;
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
  @IsBoolean()
  @ValidateNested()
  groupChat: GroupChatDto;
  @ValidateNested()
  profile: MessageProfileDto;
}
