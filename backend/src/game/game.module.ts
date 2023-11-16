import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [MatchModule],
  providers: [GameGateway, GameService],
  controllers: [GameController],
  exports: [GameGateway, GameService]
})
export class GameModule {}
