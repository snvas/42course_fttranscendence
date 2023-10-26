import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';
import { MessageGroupChatDto } from './message-group-chat.dto';

export class GroupMessageDto {
  @IsOptional()
  @IsNumber()
  id?: number;
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
