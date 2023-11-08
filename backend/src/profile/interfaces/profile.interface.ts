import {
  AvatarEntity,
  BlockEntity,
  FriendEntity,
  GroupChatEntity,
  GroupMemberEntity,
  PrivateMessageEntity,
  UserEntity,
} from '../../db/entities';
import { MatchEntity } from '../../db/entities/match.entity';

export interface Profile {
  id: number;
  nickname?: string;
  level?: number;
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
  friendBy: FriendEntity[];
  blockedUsers: BlockEntity[];
  blockedBy: BlockEntity[];
  matchsAsP1: MatchEntity[];
  matchsAsP2: MatchEntity[];
  createdAt: Date;
  updatedAt: Date;
}
