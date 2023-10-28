import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';

@Module({
  controllers: [GameController],
  providers: [GameGateway],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [],
})
export class GameModule {}
