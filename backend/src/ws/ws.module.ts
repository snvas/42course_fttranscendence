import { Module } from '@nestjs/common';
import { PlayerStatusService } from '../profile/services/player-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GroupChatService } from '../chat/services/group-chat.service';

@Module({
  providers: [GroupChatService, PlayerStatusService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [GroupChatService, PlayerStatusService],
})
export class WsModule {}
