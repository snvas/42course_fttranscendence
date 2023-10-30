import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from '../profile/profile.service';
import { UserService } from '../user/user.service';
import { AvatarService } from '../avatar/avatar.service';
import { ChatController } from './chat.controller';
import { ChatManagementGuard } from './guards/chat-management.guard';
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatAdminGuard } from './guards/chat-admin-guard';
import { GroupChatService } from './services/group-chat.service';
import { PrivateChatService } from './services/private-chat.service';
import { GroupMemberService } from './services/group-member.service';
import { PlayerStatusService } from '../profile/services/player-status.service';
import { GroupMessageService } from './services/group-message.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    PlayerStatusService,
    PrivateChatService,
    GroupChatService,
    GroupMessageService,
    GroupMemberService,
    WsAuthenticatedGuard,
    ChatManagementGuard,
    ChatOwnerGuard,
    ChatAdminGuard,
    ProfileService,
    UserService,
    AvatarService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [
    ChatService,
    PlayerStatusService,
    PrivateChatService,
    GroupChatService,
    GroupMessageService,
    GroupMemberService,
    ProfileService,
    UserService,
    AvatarService,
  ],
})
export class ChatModule {}
