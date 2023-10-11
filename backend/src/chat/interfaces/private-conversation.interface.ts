import { MessageProfile } from './message-profile.interface';

export interface Conversation {
  id: number;
  message: string;
  createdAt: Date;
  sender: MessageProfile;
}
