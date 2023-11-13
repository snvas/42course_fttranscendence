import { ProfileEntity } from '../../db/entities';

export class Friend {
  id: number;
  profile: ProfileEntity;
  friend: ProfileEntity;
}
