import { Module } from '@nestjs/common';
import { PlayerStatusService } from '../chat/services/player-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GroupChatService } from '../chat/services/group-chat.service';

@Module({
  providers: [GroupChatService, PlayerStatusService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [],
})
export class ChatModule {}
