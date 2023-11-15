import { Module } from '@nestjs/common';
import { StatusService } from '../status/status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { BlockService } from './services/block.service';
import { FriendService } from './services/friend.service';
import { SocialGateway } from './social.gateway';

@Module({
  providers: [StatusService, BlockService, FriendService, SocialGateway],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [StatusService, BlockService, FriendService],
})
export class WsModule {}
