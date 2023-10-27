import { ChatMessage } from '../../interfaces/tmp/chat-message.interface';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto implements ChatMessage {
  @IsString()
  @IsNotEmpty()
  message: string;
}
