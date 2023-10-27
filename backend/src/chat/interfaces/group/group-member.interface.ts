import { GroupChatEntity, ProfileEntity } from '../../../db/entities';

export interface GroupMember {
  role: string;
  isMuted: boolean;
  groupChat: GroupChatEntity;
  profile: ProfileEntity;
  createdAt: Date;
}
