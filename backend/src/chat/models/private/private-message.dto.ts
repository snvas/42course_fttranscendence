import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from '../message/message-profile.dto';

export class PrivateMessageDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsNotEmptyObject()
  @ValidateNested()
  receiver: MessageProfileDto;
  @IsNotEmptyObject()
  @ValidateNested()
  sender: MessageProfileDto;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
