import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { GroupMemberRoleUpdate } from '../../interfaces/group/group-member-role-update';

export class GroupMemberRoleUpdateDto implements GroupMemberRoleUpdate {
  @IsNotEmpty()
  @IsIn(['user', 'admin'])
  @IsString()
  role: 'user' | 'admin';
}
