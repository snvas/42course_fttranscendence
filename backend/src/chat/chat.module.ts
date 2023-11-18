import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ChatController } from './chat.controller';
import { ChatManagementGuard } from './guards/chat-management.guard';
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatAdminGuard } from './guards/chat-admin-guard';
import { GroupChatService } from './services/group-chat.service';
import { PrivateChatService } from './services/private-chat.service';
import { GroupMemberService } from './services/group-member.service';
import { GroupMessageService } from './services/group-message.service';
import { StatusModule } from '../status/status.module';
import { ProfileModule } from '../profile/profile.module';
import { SocialModule } from '../social/social.module';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    PrivateChatService,
    GroupChatService,
    GroupMessageService,
    GroupMemberService,
    ChatManagementGuard,
    ChatOwnerGuard,
    ChatAdminGuard,
  ],
  imports: [
    TypeOrmModule.forFeature(entities),
    StatusModule,
    ProfileModule,
    SocialModule,
  ],
  exports: [GroupChatService],
})
export class ChatModule {}
