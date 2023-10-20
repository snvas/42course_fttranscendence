import { GroupChatHistory } from '../interfaces/group-chat-history.interface';
import { Conversation } from '../interfaces/private-conversation.interface';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';

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
  members: MessageProfileDto[];
  @IsNotEmptyObject()
  @ValidateNested()
  @IsArray()
  messages: Conversation[];
}
