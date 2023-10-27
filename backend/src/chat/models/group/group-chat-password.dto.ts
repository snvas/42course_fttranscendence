import { GroupChatPassword } from '../../interfaces/group/group-chat-password.interface';
import { IsNotEmpty, IsString } from 'class-validator';

export class GroupChatPasswordDto implements GroupChatPassword {
  @IsString()
  @IsNotEmpty()
  password: string;
}
