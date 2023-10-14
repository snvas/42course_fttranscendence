import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from './message-profile.dto';

export class PrivateMessageDto {
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
