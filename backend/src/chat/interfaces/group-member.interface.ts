import { GroupChatEntity, ProfileEntity } from '../../db/entities';

export interface GroupMember {
  id: number;
  role: string;
  groupChat: GroupChatEntity;
  profile: ProfileEntity;
  createdAt: Date;
}
