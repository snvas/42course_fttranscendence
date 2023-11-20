import { Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'blocks' })
@Index(['profile', 'blockedUser'], { unique: true })
export class BlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.blockedUsers, {
    onDelete: 'CASCADE',
  })
  profile: ProfileEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.blockedBy, {
    onDelete: 'CASCADE',
  })
  blockedUser: ProfileEntity;
}
