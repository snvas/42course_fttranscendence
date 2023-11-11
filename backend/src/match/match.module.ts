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
import { MatchGameService } from './services/match-game.service';

@Module({
  controllers: [MatchController],
  providers: [
    WsAuthenticatedGuard,
    MatchService,
    MatchGameService,
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
    MatchGameService,
  ],
})
export class MatchModule {}
