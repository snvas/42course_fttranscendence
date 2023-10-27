import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from '../message/message-profile.dto';
import { MessageGroupChatDto } from '../message/message-group-chat.dto';

export class GroupMessageDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @ValidateNested()
  groupChat: MessageGroupChatDto;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @ValidateNested()
  sender: MessageProfileDto;
}
