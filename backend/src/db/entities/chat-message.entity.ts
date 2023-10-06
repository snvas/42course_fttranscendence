import ChatMessage from '../../chat/interfaces/chat-message.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'channel_messages' })
export class ChatMessageEntity implements ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
