import { ProfileEntity } from '../../../db/entities';

export interface PrivateMessage {
  id: number;
  sender: ProfileEntity;
  receiver: ProfileEntity;
  message: string;
  createdAt: Date;
}
