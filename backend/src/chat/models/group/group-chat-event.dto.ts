import { IsNotEmpty, IsNumber } from 'class-validator';
import { GroupChatEvent } from '../../interfaces/group/group-chat-event.interface';

export class GroupChatEventDto implements GroupChatEvent {
  @IsNotEmpty()
  @IsNumber()
  chatId: number;
}
