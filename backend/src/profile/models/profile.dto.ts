import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Profile } from '../interfaces/profile.interface';
import { FortyTwoUserDto } from '../../user/models/forty-two-user.dto';
import { Type } from 'class-transformer';
import { AvatarEntity } from 'src/db/entities';
import { GroupChatEntity } from 'src/db/entities/group-chat.entity';
import { GroupMemberEntity } from 'src/db/entities/group-member.entity';

export class ProfileDTO implements Profile {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsString()
  @IsNotEmpty()
  nickname: string;
  @IsNumber()
  wins?: number;
  @IsNumber()
  losses?: number;
  @IsNumber()
  draws?: number;
  @IsNumber()
  avatarId?: number;
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => FortyTwoUserDto)
  userEntity: FortyTwoUserDto;
  @ValidateNested()
  avatar?: AvatarEntity | undefined;
  @ValidateNested()
  groupMemberships: GroupMemberEntity[];
  @ValidateNested()
  ownedGroupChats: GroupChatEntity[];

  constructor(partial: Partial<ProfileDTO>) {
    Object.assign(this, partial);
  }
}
