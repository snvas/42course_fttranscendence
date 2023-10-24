import { Conversation } from './private-conversation.interface';
import { GroupProfileDto } from '../models/group-profile.dto';

export interface GroupChatHistory {
  id: number;
  name: string;
  owner: string;
  visibility: string;
  createdAt: Date;
  members: GroupProfileDto[];
  messages: Conversation[];
}
