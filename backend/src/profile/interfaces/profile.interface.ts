import { GroupMemberEntity } from '../../db/entities/group-member.entity';
import { AvatarEntity, UserEntity } from '../../db/entities';
import { GroupChatEntity } from '../../db/entities/group-chat.entity';

export interface Profile {
  id: number;
  nickname?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  avatarId?: number;
  avatar?: AvatarEntity;
  userEntity: UserEntity;
  groupMemberships: GroupMemberEntity[];
  ownedGroupChats: GroupChatEntity[];
}
