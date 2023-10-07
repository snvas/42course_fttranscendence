import { Group } from '../interfaces/group.interface';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GroupDto implements Group {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  owner_id: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  visibility: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
