import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Profile } from '../interfaces/profile.interface';
import { FortyTwoUserDto } from '../../user/models/forty-two-user.dto';
import { Type } from 'class-transformer';
import {
  AvatarEntity,
  BlockEntity,
  FriendEntity,
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
} from 'src/db/entities';

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
  @ValidateNested()
  receivedPrivateMessages: PrivateMessageEntity[];
  @ValidateNested()
  sentPrivateMessages: PrivateMessageEntity[];
  @ValidateNested()
  groupMessages: GroupMessageEntity[];
  @ValidateNested()
  blockedBy: BlockEntity[];
  @ValidateNested()
  blockedUsers: BlockEntity[];
  @ValidateNested()
  friends: FriendEntity[];
  @ValidateNested()
  friendBy: FriendEntity[];
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  constructor(partial: Partial<ProfileDTO>) {
    Object.assign(this, partial);
  }
}
