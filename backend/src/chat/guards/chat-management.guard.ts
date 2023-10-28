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
import { GroupMemberService } from '../services/group-member.service';
import { GroupChatEntity } from '../../db/entities';

//This guard is used to authorize group **chat members** actions: Owner >> Admin >> User

@Injectable()
export class ChatManagementGuard implements CanActivate {
  private readonly logger: Logger = new Logger(ChatManagementGuard.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly groupChatService: GroupChatService,
    private readonly groupMemberService: GroupMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: FortyTwoUserDto = request.user as FortyTwoUserDto;
    const { chatId, profileId } = request.params;
    const asker: ProfileDTO = await this.profileService.findByUserId(user.id);
    const receiver: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    if (!chatId || !receiver.id) {
      this.logger.warn(
        `### Rejected: This route needs chatId and profileId path parameters`,
      );
      return false;
    }

    const groupChat: GroupChatEntity =
      await this.groupChatService.getGroupChatById(chatId);

    const [askerRole, receiverRole]: [ChatRole, ChatRole] = await Promise.all([
      this.groupMemberService.getGroupMemberRole(groupChat, asker),
      this.groupMemberService.getGroupMemberRole(groupChat, receiver),
    ]);

    if (
      (askerRole.role === 'owner' && receiverRole.role !== 'owner') ||
      (askerRole.role === 'admin' && receiverRole.role === 'user')
    ) {
      return true;
    }

    this.logger.warn(
      `### Rejected: Asker [${asker.id}] - [${askerRole.role}] cannot do any action on user [${receiver.id}] - [${receiverRole.role}]`,
    );
    return false;
  }
}
