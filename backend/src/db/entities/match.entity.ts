import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Match } from '../../match/interfaces/match.interface';
import { ProfileEntity } from './profile.entity';

@Entity('matchs')
export class MatchEntity implements Match {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => ProfileEntity, (profile) => profile.matchsAsP1)
  p1: ProfileEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.matchsAsP2)
  p2: ProfileEntity;

  @Column({ default: false })
  p1Joined: boolean;

  @Column({ default: false })
  p2Joined: boolean;

  @Column({ default: 0 })
  p1Score: number;

  @Column({ default: 0 })
  p2Score: number;

  @Column({ default: 'waitingPlayers' })
  status: 'waitingPlayers' | 'started' | 'finished' | 'rejected' | 'abandoned';

  @Column({ nullable: true })
  winner?: 'p1' | 'p2';

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
