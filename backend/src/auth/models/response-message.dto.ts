import { ResponseMessage } from '../interfaces/response-message.interface';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResponseMessageDto implements ResponseMessage {
  @IsString()
  @IsNotEmpty()
  message: string;
}
