import { GroupChat } from '../interfaces/group-chat.interface';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GroupMemberEntity } from '../../db/entities/group-member.entity';
import { GroupMessageEntity, ProfileEntity } from '../../db/entities';

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
  password: string;
  @IsString({ each: true })
  onlineUsers: string[];
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
