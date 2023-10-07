import { GroupMemberEntity } from '../../db/entities/group-member.entity';
import { GroupMessageEntity, ProfileEntity } from '../../db/entities';

export interface GroupChat {
  id: number;
  name: string;
  visibility: string;
  password?: string;
  owner: ProfileEntity;
  members: GroupMemberEntity[];
  messages: GroupMessageEntity[];
  createdAt: Date;
}
