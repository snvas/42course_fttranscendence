import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OAuth2User } from '../../auth';

@Entity({ name: 'users' })
export class UserEntity implements OAuth2User {
  @PrimaryColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  displayName: string;

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
