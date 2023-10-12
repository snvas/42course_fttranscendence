import { GroupChat } from '../interfaces/group-chat.interface';
import {
  IsDate,
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
  @IsNotEmpty()
  @IsNumber()
  ownerId: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  visibility: string;
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
