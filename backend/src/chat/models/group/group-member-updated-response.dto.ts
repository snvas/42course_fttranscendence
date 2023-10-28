import { IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { GroupMemberUpdatedResponse } from '../../interfaces/group/group-member-updated-response.interface';

export class GroupMemberUpdatedResponseDto
  implements GroupMemberUpdatedResponse
{
  @IsBoolean()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
