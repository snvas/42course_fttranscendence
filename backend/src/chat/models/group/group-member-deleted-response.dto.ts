import { GroupMemberDeletedResponse } from '../../interfaces/group/group-member-deleted-response.interface';

export class GroupMemberDeletedResponseDto
  implements GroupMemberDeletedResponse
{
  deleted: boolean;
  affected: number;
}
