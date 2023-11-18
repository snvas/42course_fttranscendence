import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { WsAuthenticatedGuard } from '../ws/guards/ws-authenticated.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { MatchService } from './match.service';
import { MatchGateway } from './match.gateway';
import { MatchGameService } from './services/match-game.service';
import { MatchAnswerGuard } from './guards/match-answer.guard';
import { StatusModule } from '../status/status.module';
import { ProfileModule } from '../profile/profile.module';
import { SocialModule } from '../social/social.module';

@Module({
  controllers: [MatchController],
  providers: [
    WsAuthenticatedGuard,
    MatchService,
    MatchGameService,
    MatchGateway,
    MatchAnswerGuard,
  ],
  imports: [
    TypeOrmModule.forFeature(entities),
    StatusModule,
    ProfileModule,
    SocialModule,
  ],
  exports: [MatchGameService],
})
export class MatchModule {}
