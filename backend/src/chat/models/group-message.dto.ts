import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GroupMessage } from '../interfaces/group-message.interface';
import { GroupChatEntity } from '../../db/entities';
import { MessageProfileDto } from './message-profile.dto';

export class GroupMessageDto implements GroupMessage {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  group_id: number;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @ValidateNested()
  groupChat: GroupChatEntity;
  @ValidateNested()
  sender: MessageProfileDto;
}
