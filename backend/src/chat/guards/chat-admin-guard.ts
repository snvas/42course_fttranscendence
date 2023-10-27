import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FortyTwoUserDto } from '../../user/models/forty-two-user.dto';
import { ProfileService } from '../../profile/profile.service';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { ChatRole } from '../types/chat-role.type';
import { GroupChatService } from '../services/group-chat.service';

// This guard is used to authorize actions from group chat admin/owner members to non-members

@Injectable()
export class ChatAdminGuard implements CanActivate {
  private readonly logger: Logger = new Logger(ChatAdminGuard.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly groupChatService: GroupChatService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: FortyTwoUserDto = request.user as FortyTwoUserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);
    const { chatId } = request.params;

    if (!chatId) {
      this.logger.warn(`### Rejected: This route needs chatId path parameter`);
      return false;
    }

    const chatRole: ChatRole = await this.groupChatService.getGroupMemberRole(
      chatId,
      profile.id,
    );

    if (chatRole.role !== 'admin' && chatRole.role !== 'owner') {
      this.logger.warn(
        `### Rejected, profile [${profile.id}] is not admin/owner of Group Chat: [${chatId}]`,
      );

      return false;
    }

    return true;
  }
}
