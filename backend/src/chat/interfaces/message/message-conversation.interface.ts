import { MessageProfile } from './message-profile.interface';

export interface MessageConversation {
  id?: number;
  message: string;
  createdAt: Date;
  sender: MessageProfile;
  receiver?: MessageProfile;
}
