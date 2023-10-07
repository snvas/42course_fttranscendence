import { UserEntity } from './user.entity';
import { SessionEntity } from './session.entity';
import { ProfileEntity } from './profile.entity';
import { AvatarEntity } from './avatar.entity';
import { GroupMessageEntity } from './group-message.entity';
import { GroupChatEntity } from './group-chat.entity';
import { GroupMemberEntity } from './group-member.entity';
import { PrivateMessageEntity } from './private-message.entity';

const entities = [
  UserEntity,
  SessionEntity,
  ProfileEntity,
  AvatarEntity,
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
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
};

export default entities;
