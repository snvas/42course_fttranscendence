import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Oauth2UserDto } from '../../user/models/oauth2-user.dto';
import { ProfileService } from '../../profile/profile.service';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { ChatRole } from '../types/chat-role.type';
import { GroupMemberService } from '../services/group-member.service';
import { GroupChatEntity } from '../../db/entities';
import { GroupChatService } from '../services/group-chat.service';

// This guard is used to authorize actions from group chat admin/owner members to non-members

@Injectable()
export class ChatAdminGuard implements CanActivate {
  private readonly logger: Logger = new Logger(ChatAdminGuard.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly groupChatService: GroupChatService,
    private readonly groupMemberService: GroupMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: Oauth2UserDto = request.user as Oauth2UserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);
    const { chatId } = request.params;

    if (!chatId) {
      this.logger.warn(`### Rejected: This route needs chatId path parameter`);
      return false;
    }

    const groupChat: GroupChatEntity =
      await this.groupChatService.getGroupChatById(chatId);

    const chatRole: ChatRole = await this.groupMemberService.getGroupMemberRole(
      groupChat,
      profile,
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
