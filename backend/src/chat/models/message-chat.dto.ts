import { MessageChat } from '../interfaces/message-group.interface';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageChatDto implements MessageChat {
  @IsNotEmpty()
  @IsString()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  name: string;
}
