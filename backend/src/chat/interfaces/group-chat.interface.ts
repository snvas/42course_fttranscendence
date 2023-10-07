import {
  GroupMemberEntity,
  GroupMessageEntity,
  ProfileEntity,
} from '../../db/entities';

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
