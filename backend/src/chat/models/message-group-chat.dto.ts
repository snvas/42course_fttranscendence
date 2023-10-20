import { MessageGroupChat } from '../interfaces/message-group.interface';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageGroupChatDto implements MessageGroupChat {
  @IsNotEmpty()
  @IsString()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  name: string;
}
