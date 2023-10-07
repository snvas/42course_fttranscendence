import { GroupChatEntity, ProfileEntity } from '../../db/entities';

export interface GroupMessage {
  id: number;
  groupChat: GroupChatEntity;
  sender: ProfileEntity;
  message: string;
  createdAt: Date;
}
