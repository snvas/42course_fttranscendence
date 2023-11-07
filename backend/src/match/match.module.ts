import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { PlayerStatusService } from '../profile/services/player-status.service';
import { ProfileService } from '../profile/profile.service';
import { AvatarService } from '../avatar/avatar.service';
import { UserService } from '../user/user.service';
import { BlockService } from '../profile/services/block.service';
import { WsAuthenticatedGuard } from '../chat/guards/ws-authenticated.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { MatchService } from './match.service';
import { MatchGateway } from './match.gateway';

@Module({
  controllers: [MatchController],
  providers: [
    WsAuthenticatedGuard,
    MatchService,
    MatchGateway,
    PlayerStatusService,
    BlockService,
    ProfileService,
    UserService,
    AvatarService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [
    PlayerStatusService,
    ProfileService,
    UserService,
    AvatarService,
    BlockService,
    MatchService,
  ],
})
export class MatchModule {}
