import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMessage } from '../../chat/interfaces/group-message.interface';

@Entity({ name: 'group_messages' })
export class GroupMessageEntity implements GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group_id: number;

  @Column()
  sender_id: number;

  @Column()
  sender_name: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
