import { PrivateMessage } from '../interfaces/private-message.interface';
import { ProfileEntity } from '../../db/entities';
import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PrivateMessageDto implements PrivateMessage {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsNotEmptyObject()
  @ValidateNested()
  receiver: ProfileEntity;
  @IsNotEmptyObject()
  @ValidateNested()
  sender: ProfileEntity;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
