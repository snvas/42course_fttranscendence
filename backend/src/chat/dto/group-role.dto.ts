import { GroupRole } from '../interfaces/group-role.interface';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class GroupRoleDto implements GroupRole {
  @IsString()
  @IsIn(['admin', 'user'])
  @IsNotEmpty()
  role: string;
}
