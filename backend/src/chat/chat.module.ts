import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from '../profile/profile.service';
import { UserService } from '../user/user.service';
import { AvatarService } from '../avatar/avatar.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    ProfileService,
    UserService,
    AvatarService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [],
})
export class ChatModule {}
