import {
  GroupMemberEntity,
  GroupMessageEntity,
  ProfileEntity,
} from '../../db/entities';

export interface GroupChat {
  id: number;
  name: string;
  visibility: string;
  password?: string | null;
  owner: ProfileEntity;
  members: GroupMemberEntity[];
  bannedMembers: GroupMemberEntity[];
  messages: GroupMessageEntity[];
  createdAt: Date;
}
