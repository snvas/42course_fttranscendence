import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GroupChatService } from '../chat/services/group-chat.service';
import { BlockService } from '../social/services/block.service';
import { FriendService } from '../social/services/friend.service';

@Module({
  providers: [GroupChatService, StatusService, BlockService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [GroupChatService, StatusService, FriendService],
})
export class WsModule {}
