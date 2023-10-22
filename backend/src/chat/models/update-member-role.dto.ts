import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { UpdateMemberRoleInterface } from '../interfaces/update-member-role.interface';

export class UpdateMemberRoleDto implements UpdateMemberRoleInterface {
  @IsNotEmpty()
  @IsIn(['user', 'admin'])
  @IsString()
  role: 'user' | 'admin';
}
