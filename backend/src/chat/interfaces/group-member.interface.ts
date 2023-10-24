import { GroupChatEntity, ProfileEntity } from '../../db/entities';

export interface GroupMember {
  id: number;
  role: string;
  isMuted: boolean;
  isBanned: boolean;
  groupChat: GroupChatEntity;
  profile: ProfileEntity;
  createdAt: Date;
}
