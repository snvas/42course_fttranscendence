import { Injectable, Logger } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { PlayerStatusService } from './services/player-status.service';
import { PrivateChatService } from './services/private-chat.service';
import { GroupChatService } from './services/group-chat.service';
import { GroupMemberService } from './services/group-member.service';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly playerStatusService: PlayerStatusService,
    private readonly privateChatService: PrivateChatService,
    private readonly groupChatService: GroupChatService,
    private readonly groupMemberService: GroupMemberService,
  ) {}
}
