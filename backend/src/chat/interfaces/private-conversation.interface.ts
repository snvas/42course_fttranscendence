import { MessageProfile } from './message-profile.interface';

export interface PrivateConversation {
  id: number;
  message: string;
  createdAt: Date;
  sender: MessageProfile;
  receiver: MessageProfile;
}
