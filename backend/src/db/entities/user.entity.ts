import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FortyTwoUser } from '../../auth';

@Entity({ name: 'users' })
export class UserEntity implements FortyTwoUser {
  @PrimaryColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  displayName: string;

  @Column()
  profileUrl: string;

  @Column({ default: false })
  otpEnabled?: boolean;

  @Column({ nullable: true, default: false })
  otpValidated?: boolean;

  @Column({ nullable: true })
  otpSecret?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
