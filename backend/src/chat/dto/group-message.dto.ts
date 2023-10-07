import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GroupMessage } from '../interfaces/group-message.interface';

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
}
