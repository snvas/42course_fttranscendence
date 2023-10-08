import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMember } from '../../chat/interfaces/group-member.interface';
import { GroupChatEntity } from './group-chat.entity';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'group_members' })
export class GroupMemberEntity implements GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'user' })
  role: string;

  @ManyToOne(() => GroupChatEntity, (chat) => chat.members)
  groupChat: GroupChatEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.groupMemberships)
  profile: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;
}
