import {
  AvatarEntity,
  BlockEntity,
  FriendEntity,
  GroupChatEntity,
  GroupMemberEntity,
  PrivateMessageEntity,
  UserEntity,
} from '../../db/entities';

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
  friendBy: FriendEntity[];
  blockedUsers: BlockEntity[];
  blockedBy: BlockEntity[];
  createdAt: Date;
  updatedAt: Date;
}
