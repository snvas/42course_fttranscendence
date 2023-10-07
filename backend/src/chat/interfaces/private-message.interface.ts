import { ProfileEntity } from '../../db/entities';

export interface PrivateMesse {
  id: number;
  sender: ProfileEntity;
  receiver: ProfileEntity;
  message: string;
  createdAt: Date;
}
