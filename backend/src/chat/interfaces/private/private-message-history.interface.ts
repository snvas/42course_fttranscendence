import { MessageConversation } from '../message/message-conversation.interface';

export interface PrivateMessageHistory {
  id: number;
  nickname: string;
  avatarId?: number;
  messages: MessageConversation[];
}
