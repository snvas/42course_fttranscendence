import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { StatusModule } from '../status/status.module';
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';
import { ChatModule } from '../chat/chat.module';

@Module({
  providers: [WsAuthenticatedGuard],
  imports: [TypeOrmModule.forFeature(entities), StatusModule, ChatModule],
  exports: [WsAuthenticatedGuard],
})
export class WsModule {}
