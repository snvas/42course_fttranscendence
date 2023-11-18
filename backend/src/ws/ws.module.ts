import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { StatusModule } from '../status/status.module';
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';
import { WsGateway } from './ws.gateway';

@Module({
  providers: [WsAuthenticatedGuard, WsGateway],
  imports: [TypeOrmModule.forFeature(entities), StatusModule],
  exports: [WsAuthenticatedGuard, WsGateway],
})
export class WsModule {}
