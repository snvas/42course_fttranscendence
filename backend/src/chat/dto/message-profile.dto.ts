import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MessageProfile } from '../interfaces/message-profile.interface';

export class MessageProfileDto implements MessageProfile {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
