import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import ChatMessage from '../interfaces/chat-message.interface';

export class ChatMessageDto implements ChatMessage {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
