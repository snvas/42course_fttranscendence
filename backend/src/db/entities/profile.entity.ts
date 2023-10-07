import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Profile } from '../../profile/interfaces/profile.interface';
import { AvatarEntity } from './avatar.entity';
import { GroupChatEntity } from './group-chat.entity';
import { GroupMemberEntity } from './group-member.entity';
import { GroupMessageEntity } from './group-message.entity';

//TODO: Implementar número de amigos, lista de amigos e lista de usuários bloqueados
//TODO: Calcular rankings, estatísticas com base nos dados do perfil em tempo de execução
@Entity({ name: 'profiles' })
export class ProfileEntity implements Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column({ nullable: true, default: 0 })
  wins?: number;

  @Column({ nullable: true, default: 0 })
  losses?: number;

  @Column({ nullable: true, default: 0 })
  draws?: number;

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

  // @CreateDateColumn()
  // createdAt: Date;
  //
  // @UpdateDateColumn()
  // updatedAt: Date;
  //
  // @DeleteDateColumn()
  // deletedAt?: Date;
}
