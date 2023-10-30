import { ProfileDTO } from '../models/profile.dto';

export class Friend {
  id: number;
  profile: ProfileDTO;
  friend: ProfileDTO;
}
