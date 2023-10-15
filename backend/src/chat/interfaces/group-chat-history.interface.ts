import { Conversation } from './private-conversation.interface';

export interface GroupChatHistory {
  id: number;
  name: string;
  owner: string;
  visibility: string;
  createdAt: Date;
  messages: Conversation[];
}
