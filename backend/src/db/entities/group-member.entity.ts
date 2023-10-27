import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMember } from '../../chat/interfaces/group/group-member.interface';
import { GroupChatEntity } from './group-chat.entity';
import { ProfileEntity } from './profile.entity';

@Entity({ name: 'group_members' })
@Index(['profile', 'groupChat'], { unique: true })
export class GroupMemberEntity implements GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @ManyToOne(() => GroupChatEntity, (chat) => chat.members, {
    onDelete: 'CASCADE',
  })
  groupChat: GroupChatEntity;

  @ManyToOne(() => ProfileEntity, (profile) => profile.groupMemberships)
  profile: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
