import { GroupCreation } from '../../interfaces/group/group-creation.interface';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

//TODO: Remove visibilidade
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
