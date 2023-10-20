import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FortyTwoUserDto } from '../../user/models/forty-two-user.dto';
import { ProfileService } from '../../profile/profile.service';
import { ChatService } from '../chat.service';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { ChatRole } from '../types/chat-role.type';

//This guard is used to authorize group **chat members** actions: Owner >> Admin >> User

@Injectable()
export class ChatManagementGuard implements CanActivate {
  private readonly logger: Logger = new Logger(ChatManagementGuard.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly chatService: ChatService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: FortyTwoUserDto = request.user as FortyTwoUserDto;
    const { chatId, profileId } = request.params;
    const receiverId = Number(profileId);
    const askerId: number = await this.profileService
      .findByUserId(user.id)
      .then((p: ProfileDTO) => p.id);

    if (!chatId || !receiverId) {
      this.logger.warn(
        `### Rejected: This route needs chatId and profileId path parameters`,
      );
      return false;
    }

    const [askerRole, receiverRole]: [ChatRole, ChatRole] = await Promise.all([
      this.chatService.getGroupMemberRole(chatId, askerId),
      this.chatService.getGroupMemberRole(chatId, receiverId),
    ]);

    if (
      (askerRole.role === 'owner' && receiverRole.role !== 'owner') ||
      (askerRole.role === 'admin' && receiverRole.role === 'user')
    ) {
      return true;
    }

    this.logger.warn(
      `### Rejected: Asker [${askerId}] - [${askerRole.role}] cannot do any action on user [${receiverId}] - [${receiverRole.role}]`,
    );
    return false;
  }
}
