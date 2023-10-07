import { GroupMember } from '../interfaces/group-member.interface';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GroupMemberDto implements GroupMember {
  @IsNotEmpty()
  @IsNumber()
  member_id: number;
  @IsNotEmpty()
  @IsNumber()
  group_id: number;
  @IsString()
  @IsNotEmpty()
  role: string;
  @IsString()
  @IsNotEmpty()
  status: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
