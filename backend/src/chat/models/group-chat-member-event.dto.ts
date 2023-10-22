import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GroupChatMemberEvent } from '../interfaces/group-chat-member-event.interface';

export class GroupChatMemberEventDto implements GroupChatMemberEvent {
  @IsNotEmpty()
  @IsNumber()
  chatId: number;
  @IsNotEmpty()
  @IsNumber()
  profileId: number;
  @IsNotEmpty()
  @IsString()
  role: 'user' | 'admin';
}
