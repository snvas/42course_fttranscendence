import { Module } from '@nestjs/common';
import { PlayerStatusService } from './services/player-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { BlockService } from './services/block.service';
import { FriendService } from './services/friend.service';
import { SocialGateway } from './social.gateway';

@Module({
  providers: [PlayerStatusService, BlockService, FriendService, SocialGateway],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [PlayerStatusService, BlockService, FriendService],
})
export class WsModule {}
