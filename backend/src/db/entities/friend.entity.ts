import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'friends' })
export class FriendEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.friendBy)
  profile: ProfileEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.friends)
  friend: ProfileEntity;
}
