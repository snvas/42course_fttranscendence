import { UserEntity } from './user.entity';
import { SessionEntity } from './session.entity';
import { ProfileEntity } from './profile.entity';
import { AvatarEntity } from './avatar.entity';
import { GroupMessageEntity } from './group-message.entity';
import { GroupChatEntity } from './group-chat.entity';
import { GroupMemberEntity } from './group-member.entity';
import { PrivateMessageEntity } from './private-message.entity';
import { FriendEntity } from './friend.entity';
import { BlockEntity } from './block.entity';
import { MatchEntity } from './match.entity';

const entities = [
  UserEntity,
  SessionEntity,
  ProfileEntity,
  AvatarEntity,
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
  FriendEntity,
  BlockEntity,
  MatchEntity,
];

export {
  UserEntity,
  SessionEntity,
  ProfileEntity,
  AvatarEntity,
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
  FriendEntity,
  BlockEntity,
  MatchEntity,
};

export default entities;
