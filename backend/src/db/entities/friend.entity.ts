import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { Friend } from '../../profile/interfaces/friend';

@Entity({ name: 'friends' })
export class FriendEntity implements Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.friendBy)
  profile: ProfileEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.friends)
  friend: ProfileEntity;
}
