import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GroupMessage } from '../interfaces/group-message.interface';
import { GroupChatEntity, ProfileEntity } from '../../db/entities';

export class GroupMessageDto implements GroupMessage {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  group_id: number;
  @IsNotEmpty()
  @IsNumber()
  sender_id: number;
  @IsString()
  @IsNotEmpty()
  sender_name: string;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @ValidateNested()
  groupChat: GroupChatEntity;
  @ValidateNested()
  sender: ProfileEntity;
}
