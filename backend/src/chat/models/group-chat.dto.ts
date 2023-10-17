import { GroupChat } from '../interfaces/group-chat.interface';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  GroupMemberEntity,
  GroupMessageEntity,
  ProfileEntity,
} from '../../db/entities';
import { Exclude } from 'class-transformer';

export class GroupChatDto implements GroupChat {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsIn(['public', 'private'])
  @IsNotEmpty()
  visibility: 'public' | 'private';
  @IsString()
  @IsNotEmpty()
  @Exclude()
  password: string;
  @IsString({ each: true })
  playersStatus: string[];
  @ValidateNested()
  members: GroupMemberEntity[];
  @ValidateNested()
  messages: GroupMessageEntity[];
  @ValidateNested()
  owner: ProfileEntity;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
