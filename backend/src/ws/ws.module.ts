import { Module } from '@nestjs/common';
import { StatusService } from '../status/status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GroupChatService } from '../chat/services/group-chat.service';

@Module({
  providers: [GroupChatService, StatusService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [GroupChatService, StatusService],
})
export class WsModule {}
