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

@Module({
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    WsAuthenticatedGuard,
    ChatManagementGuard,
    ChatOwnerGuard,
    ChatAdminGuard,
    ProfileService,
    UserService,
    AvatarService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [],
})
export class ChatModule {}
