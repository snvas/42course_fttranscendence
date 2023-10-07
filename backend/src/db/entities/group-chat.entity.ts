import { GroupChat } from '../../chat/interfaces/group-chat.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMessageEntity } from './group-message.entity';
import { GroupMemberEntity } from './group-member.entity';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'group_chats' })
export class GroupChatEntity implements GroupChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  password?: string;

  @Column({ default: 'public' })
  visibility: string;

  @OneToMany(() => GroupMemberEntity, (member) => member.groupChat)
  members: GroupMemberEntity[];

  @OneToMany(() => GroupMessageEntity, (message) => message.groupChat)
  messages: GroupMessageEntity[];

  @ManyToOne(() => ProfileEntity, (owner) => owner.ownedGroupChats)
  owner: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;
}
