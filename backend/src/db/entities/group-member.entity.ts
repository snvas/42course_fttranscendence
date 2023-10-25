import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupMember } from '../../chat/interfaces/group-member.interface';
import { GroupChatEntity } from './group-chat.entity';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'group_members' })
@Index(['profile'], { unique: true })
export class GroupMemberEntity implements GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isMuted: boolean;

  @ManyToMany(() => GroupChatEntity, (chat) => chat.members, {
    onDelete: 'CASCADE',
  })
  groupChat: GroupChatEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.groupMemberships, {
    onDelete: 'CASCADE',
  })
  profile: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;
}
