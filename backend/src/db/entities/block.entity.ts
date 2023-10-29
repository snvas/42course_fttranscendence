import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'blocks' })
export class BlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.blockedUsers)
  profile: ProfileEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.blockedBy)
  blockedUser: ProfileEntity;
}
