import { MessageConversation } from '../message/message-conversation.interface';
import { GroupProfileDto } from '../../models/group/group-profile.dto';

export interface GroupChatHistory {
  id: number;
  name: string;
  owner: string;
  visibility: string;
  createdAt: Date;
  members: GroupProfileDto[];
  bannedMembers: GroupProfileDto[];
  messages: MessageConversation[];
}
