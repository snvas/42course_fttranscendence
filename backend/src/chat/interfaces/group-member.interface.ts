import { ProfileEntity } from '../../db/entities';
import { GroupChatEntity } from '../../db/entities/group-chat.entity';

export interface GroupMember {
  id: number;
  role: string;
  status: string;
  groupChat: GroupChatEntity;
  profile: ProfileEntity;
  createdAt: Date;
}
