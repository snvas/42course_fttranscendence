import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AvatarService } from '../avatar/avatar.service';
import { PlayerStatusService } from '../social/services/player-status.service';
import { FriendService } from '../social/services/friend.service';
import { BlockService } from '../social/services/block.service';

@Module({
  controllers: [ProfileController],
  providers: [
    UserService,
    ProfileService,
    AvatarService,
    BlockService,
    PlayerStatusService,
    FriendService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserService, AvatarService, PlayerStatusService, BlockService],
})
export class ProfileModule {}
