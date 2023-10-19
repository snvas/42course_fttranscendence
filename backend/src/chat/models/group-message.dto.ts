import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';
import { MessageChatDto } from './message-chat.dto';

export class GroupMessageDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @ValidateNested()
  groupChat: MessageChatDto;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @ValidateNested()
  sender: MessageProfileDto;
}
