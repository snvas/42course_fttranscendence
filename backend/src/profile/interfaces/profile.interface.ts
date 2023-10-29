import {
  AvatarEntity,
  GroupChatEntity,
  GroupMemberEntity,
  PrivateMessageEntity,
  UserEntity,
} from '../../db/entities';
import { FriendEntity } from '../../db/entities/friend.entity';
import { BlockEntity } from '../../db/entities/block.entity';

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
  sentPrivateMessages: PrivateMessageEntity[];
  receivedPrivateMessages: PrivateMessageEntity[];
  friends: FriendEntity[];
  friendships: FriendEntity[];
  blockedUsers: BlockEntity[];
  blockedBy: BlockEntity[];
  createdAt: Date;
  updatedAt: Date;
}
