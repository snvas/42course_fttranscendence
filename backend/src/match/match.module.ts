import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { WsAuthenticatedGuard } from '../ws/guards/ws-authenticated.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { MatchService } from './match.service';
import { MatchGameService } from './services/match-game.service';
import { MatchAnswerGuard } from './guards/match-answer.guard';
import { StatusModule } from '../status/status.module';
import { ProfileModule } from '../profile/profile.module';
import { SocialModule } from '../social/social.module';
import { WsModule } from '../ws/ws.module';

@Module({
  controllers: [MatchController],
  providers: [
    WsAuthenticatedGuard,
    MatchService,
    MatchGameService,
    MatchAnswerGuard,
  ],
  imports: [
    TypeOrmModule.forFeature(entities),
    StatusModule,
    ProfileModule,
    SocialModule,
    WsModule,
  ],
  exports: [MatchGameService],
})
export class MatchModule {}
