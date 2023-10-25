import { GroupChatHistory } from '../interfaces/group-chat-history.interface';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConversationDto } from './conversation.dto';
import { GroupProfileDto } from './group-profile.dto';

export class GroupChatHistoryDto implements GroupChatHistory {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  visibility: string;
  @IsString()
  @IsNotEmpty()
  owner: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @IsNotEmptyObject()
  @ValidateNested()
  @IsArray()
  members: GroupProfileDto[];
  @IsNotEmptyObject()
  @ValidateNested()
  @IsArray()
  bannedMembers: GroupProfileDto[];
  @IsNotEmptyObject()
  @ValidateNested()
  @IsArray()
  messages: ConversationDto[];
}
