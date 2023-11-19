import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MatchModule } from '../match/match.module';

/**
 * Represents the game module of the application.
 * This module is responsible for managing game-related functionality.
 */
@Module({
  imports: [MatchModule],
  providers: [GameGateway, GameService],
  controllers: [GameController],
  exports: [GameGateway, GameService],
})
export class GameModule {}
