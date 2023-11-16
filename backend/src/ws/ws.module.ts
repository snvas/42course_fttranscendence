import { Module } from '@nestjs/common';
import { PlayerStatusService } from './player-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GroupChatService } from '../chat/services/group-chat.service';
import { BlockService } from '../social/services/block.service';
import { FriendService } from '../social/services/friend.service';

@Module({
  providers: [GroupChatService, PlayerStatusService, BlockService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [GroupChatService, PlayerStatusService, FriendService],
})
export class WsModule {}
