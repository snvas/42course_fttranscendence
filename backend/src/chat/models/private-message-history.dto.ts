import { PrivateMessageHistory } from '../interfaces/private-message-history.interface';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConversationDto } from './conversation.dto';

export class PrivateMessageHistoryDto implements PrivateMessageHistory {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  @IsString()
  @IsNotEmpty()
  nickname: string;
  @IsNumber()
  @IsOptional()
  avatarId?: number;
  @IsNotEmptyObject()
  @ValidateNested()
  @IsArray()
  messages: ConversationDto[];
}
