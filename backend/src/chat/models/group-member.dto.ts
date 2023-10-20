import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';
import { GroupChatDto } from './group-chat.dto';

export class GroupMemberDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  role: string;
  @ValidateNested()
  groupChat: GroupChatDto;
  @ValidateNested()
  member: MessageProfileDto;
}
