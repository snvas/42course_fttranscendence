import { GroupChat } from '../../chat/interfaces/group-chat.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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

  @Column({ type: String, unique: true, nullable: true })
  password?: string | null;

  @Column({ default: 'public' })
  visibility: string;

  @ManyToMany(() => GroupMemberEntity, (member) => member.groupChat, {
    cascade: true,
  })
  @JoinTable({ name: 'group_chat_members' })
  members: GroupMemberEntity[];

  @ManyToMany(() => GroupMemberEntity, (member) => member.groupChat, {
    cascade: true,
  })
  @JoinTable({ name: 'group_chat_banned_members' })
  bannedMembers: GroupMemberEntity[];

  @OneToMany(() => GroupMessageEntity, (message) => message.groupChat)
  messages: GroupMessageEntity[];

  @ManyToOne(() => ProfileEntity, (owner) => owner.ownedGroupChats)
  owner: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;
}
