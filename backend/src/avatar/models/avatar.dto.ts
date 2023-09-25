import Avatar from '../interfaces/avatar.interface';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class AvatarDTO implements Avatar {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsString()
  filename: string;
  @IsNotEmptyObject()
  @Exclude()
  data: Uint8Array;
}
