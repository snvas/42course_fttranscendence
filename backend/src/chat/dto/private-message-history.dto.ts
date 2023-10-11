import { PrivateMessageHistory } from '../interfaces/private-message-history.interface';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PrivateConversationDto } from './private-conversation.dto';

export class PrivateMessageHistoryDto implements PrivateMessageHistory {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  nickname: string;
  @IsNotEmptyObject()
  @ValidateNested()
  @IsArray()
  messages: PrivateConversationDto[];
}
