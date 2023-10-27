import { MessageConversation } from '../../interfaces/message/message-conversation.interface';
import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';

export class MessageConversationDto implements MessageConversation {
  @IsOptional()
  @IsNotEmpty()
  id?: number;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @IsNotEmptyObject()
  @ValidateNested()
  sender: MessageProfileDto;
}
