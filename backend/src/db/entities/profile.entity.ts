import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Profile } from '../../profile/interfaces/profile.interface';
import { AvatarEntity } from './avatar.entity';
import { GroupChatEntity } from './group-chat.entity';
import { GroupMemberEntity } from './group-member.entity';
import { GroupMessageEntity } from './group-message.entity';
import { PrivateMessageEntity } from './private-message.entity';
import { FriendEntity } from './friend.entity';
import { BlockEntity } from './block.entity';
import { MatchEntity } from './match.entity';

@Entity({ name: 'profiles' })
export class ProfileEntity implements Omit<Profile, 'level_percentage'> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @OneToOne(() => AvatarEntity, {
    nullable: true,
  })
  @Column({ nullable: true })
  avatarId?: number;

  @JoinColumn({ name: 'avatarId' })
  avatar?: AvatarEntity;

  @OneToOne(() => UserEntity, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  userEntity: UserEntity;

  @OneToMany(() => GroupChatEntity, (groupChat) => groupChat.owner)
  ownedGroupChats: GroupChatEntity[];

  @OneToMany(() => GroupMessageEntity, (groupMessage) => groupMessage.sender)
  groupMessages: GroupMessageEntity[];

  @OneToMany(() => GroupMemberEntity, (groupMember) => groupMember.profile)
  groupMemberships: GroupMemberEntity[];

  @OneToMany(() => PrivateMessageEntity, (message) => message.sender)
  sentPrivateMessages: PrivateMessageEntity[];

  @OneToMany(() => PrivateMessageEntity, (message) => message.receiver)
  receivedPrivateMessages: PrivateMessageEntity[];

  @OneToMany(() => FriendEntity, (friendship) => friendship.profile)
  friends: FriendEntity[];

  @OneToMany(() => FriendEntity, (friendship) => friendship.friend)
  friendBy: FriendEntity[];

  @OneToMany(() => BlockEntity, (block) => block.profile)
  blockedUsers: BlockEntity[];

  @OneToMany(() => BlockEntity, (block) => block.blockedUser)
  blockedBy: BlockEntity[];

  @OneToMany(() => MatchEntity, (match) => match.p1)
  matchsAsP1: MatchEntity[];

  @OneToMany(() => MatchEntity, (match) => match.p2)
  matchsAsP2: MatchEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
