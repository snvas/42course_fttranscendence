import { ProfileEntity } from '../../db/entities';
import { GroupChatEntity } from '../../db/entities/group-chat.entity';

export interface GroupMessage {
  id: number;
  groupChat: GroupChatEntity;
  sender: ProfileEntity;
  message: string;
  createdAt: Date;
}
