import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageProfileDto } from '../message/message-profile.dto';
import { Exclude } from 'class-transformer';

export class GroupChatDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsIn(['public', 'private'])
  @IsNotEmpty()
  visibility: string;
  @ValidateNested()
  owner: MessageProfileDto;
  @Exclude()
  password: string | null;
}
