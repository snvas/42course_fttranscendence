import { MessageProfile } from '../message/message-profile.interface';

export interface GroupProfile {
  id: number;
  profile: MessageProfile;
  role: string;
  isMuted: boolean;
}
