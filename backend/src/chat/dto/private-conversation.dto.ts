import { PrivateConversation } from '../interfaces/private-conversation.interface';
import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';

export class PrivateConversationDto implements PrivateConversation {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @IsNotEmptyObject()
  @ValidateNested()
  sender: MessageProfileDto;
  @IsNotEmptyObject()
  @ValidateNested()
  receiver: MessageProfileDto;
}
