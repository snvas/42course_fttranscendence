import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GroupChatService } from '../chat/services/group-chat.service';
import { StatusModule } from '../status/status.module';

@Module({
  providers: [GroupChatService],
  imports: [TypeOrmModule.forFeature(entities), StatusModule],
  exports: [GroupChatService],
})
export class WsModule {}
