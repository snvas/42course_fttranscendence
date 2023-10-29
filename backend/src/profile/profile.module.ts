import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AvatarService } from '../avatar/avatar.service';
import { PlayerStatusService } from './services/player-status.service';

@Module({
  controllers: [ProfileController],
  providers: [UserService, ProfileService, AvatarService, PlayerStatusService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserService, AvatarService, PlayerStatusService],
})
export class ProfileModule {}
