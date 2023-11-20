import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { PrivateMessage } from '../../chat/interfaces/private/private-message.interface';

@Entity({ name: 'private_messages' })
export class PrivateMessageEntity implements PrivateMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileEntity, (sender) => sender.sentPrivateMessages, {
    onDelete: 'CASCADE',
  })
  sender: ProfileEntity;

  @ManyToOne(
    () => ProfileEntity,
    (receiver) => receiver.receivedPrivateMessages,
    {
      onDelete: 'CASCADE',
    },
  )
  receiver: ProfileEntity;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
