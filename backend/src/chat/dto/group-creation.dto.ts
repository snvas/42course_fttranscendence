import { GroupCreation } from '../interfaces/group-creation.interface';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GroupCreationDto implements GroupCreation {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  visibility: string;
  @IsString()
  @IsOptional()
  password?: string;
}
