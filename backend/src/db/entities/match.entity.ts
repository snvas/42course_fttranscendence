import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MatchHistory } from '../../match/interfaces/match-history.interface';
import { ProfileEntity } from './profile.entity';

@Entity('matchs')
export class MatchEntity implements MatchHistory {
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

  @Column({ default: 'draw' })
  winner: 'p1' | 'p2' | 'draw';

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
