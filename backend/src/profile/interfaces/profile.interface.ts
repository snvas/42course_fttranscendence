import {
  AvatarEntity,
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
}
