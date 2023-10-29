import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { GameService } from './game.service';

@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [GameService],
})
export class GameModule {}
