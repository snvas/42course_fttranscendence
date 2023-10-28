import { IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { GroupChatUpdatedResponse } from '../../interfaces/group/group-chat-updated-response.interface';

export class GroupChatUpdatedResponseDto implements GroupChatUpdatedResponse {
  @IsBoolean()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
