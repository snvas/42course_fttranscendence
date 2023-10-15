import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMessage } from '../../chat/interfaces/group-message.interface';
import { GroupChatEntity } from './group-chat.entity';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'group_messages' })
export class GroupMessageEntity implements GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => GroupChatEntity, (chat) => chat.messages)
  groupChat: GroupChatEntity;

  @ManyToOne(() => ProfileEntity, (sender) => sender.groupMessages)
  sender: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;
}
