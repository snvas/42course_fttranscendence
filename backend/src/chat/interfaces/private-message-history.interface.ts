import { Conversation } from './private-conversation.interface';

export interface PrivateMessageHistory {
  id: number;
  nickname: string;
  messages: Conversation[];
}
