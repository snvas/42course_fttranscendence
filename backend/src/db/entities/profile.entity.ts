import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Profile } from '../../profile/interfaces/profile.interface';
import { AvatarEntity } from './avatar.entity';

//TODO: Implementar número de amigos, lista de amigos e lista de usuários bloqueados
//TODO: Calcular rankings, estatísticas com base nos dados do perfil em tempo de execução
@Entity({ name: 'profiles' })
export class ProfileEntity implements Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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
}
