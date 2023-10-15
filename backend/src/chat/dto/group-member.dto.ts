import { ProfileEntity } from 'src/db/entities';
import { GroupChatEntity } from 'src/db/entities/group-chat.entity';
import { GroupMember } from '../interfaces/group-member.interface';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GroupMemberDto implements GroupMember {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  role: string;
  @IsString()
  @IsNotEmpty()
  status: string;
  @ValidateNested()
  groupChat: GroupChatEntity;
  @ValidateNested()
  profile: ProfileEntity;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
