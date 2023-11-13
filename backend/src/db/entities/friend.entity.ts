import { Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { Friend } from '../../profile/interfaces/friend.interface';

@Entity({ name: 'friends' })
@Index(['profile', 'friend'], { unique: true })
export class FriendEntity implements Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.friendBy)
  profile: ProfileEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.friends)
  friend: ProfileEntity;
}
