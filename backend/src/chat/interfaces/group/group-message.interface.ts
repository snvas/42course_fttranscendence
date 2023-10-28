import { GroupChatEntity } from '../../../db/entities';
import { MessageProfileDto } from '../../models/message/message-profile.dto';

export interface GroupMessage {
  id: number;
  groupChat: GroupChatEntity;
  sender: MessageProfileDto;
  message: string;
  createdAt: Date;
}
