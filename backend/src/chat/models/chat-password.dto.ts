import { ChatPassword } from '../interfaces/chat-password.interface';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatPasswordDto implements ChatPassword {
  @IsString()
  @IsNotEmpty()
  password: string;
}
