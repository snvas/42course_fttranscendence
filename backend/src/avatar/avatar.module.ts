import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { AvatarService } from './avatar.service';

@Module({
  controllers: [],
  providers: [AvatarService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [AvatarService],
})
export default class AvatarModule {}
