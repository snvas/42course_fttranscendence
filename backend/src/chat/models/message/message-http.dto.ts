import { MessageHttp } from '../../interfaces/message/message-http';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageHttpDto implements MessageHttp {
  @IsString()
  @IsNotEmpty()
  message: string;
}
