import { GroupCreation } from '../interfaces/group-creation.interface';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GroupCreationDto implements GroupCreation {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: string;
  @IsString()
  @IsOptional()
  password?: string;
}
