import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FortyTwoUserDto } from '../../user/models/forty-two-user.dto';
import { ProfileService } from '../../profile/profile.service';
import { ChatService } from '../chat.service';
import { GroupChatEntity, ProfileEntity } from '../../db/entities';
import { ProfileDTO } from '../../profile/models/profile.dto';

// This guard is used to authorize chat group settings only from owner member

@Injectable()
export class ChatOwnerGuard implements CanActivate {
  private readonly logger: Logger = new Logger(ChatOwnerGuard.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly chatService: ChatService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: FortyTwoUserDto = request.user as FortyTwoUserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);
    const { chatId } = request.params;
    const groupChat: GroupChatEntity = await this.chatService.getGroupChatById(
      chatId,
    );
    const owner: ProfileEntity = groupChat.owner;

    if (!chatId) {
      this.logger.warn(`### Rejected: This route needs chatId path parameter`);
      return false;
    }

    if (owner.id != profile.id) {
      this.logger.warn(
        `### Rejected, profile [${profile.id}] is not the owner of Group Chat: [${chatId}]`,
      );
      return false;
    }

    return true;
  }
}
