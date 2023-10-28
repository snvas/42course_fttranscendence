import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { GroupChatDeletedResponse } from '../../interfaces/group/group-chat-deleted-response.interface';

export class GroupChatDeletedResponseDto implements GroupChatDeletedResponse {
  @IsBoolean()
  @IsNotEmpty()
  deleted: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
