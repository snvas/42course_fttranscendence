import { Module } from '@nestjs/common';
import { BlockService } from './services/block.service';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { AvatarService } from '../avatar/avatar.service';
import { FriendService } from './services/friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { SocialController } from './social.controller';
import { StatusService } from './services/status.service';

@Module({
  controllers: [SocialController],
  providers: [
    BlockService,
    UserService,
    ProfileService,
    AvatarService,
    FriendService,
    StatusService,
  ],
  exports: [UserService, AvatarService, FriendService],
  imports: [TypeOrmModule.forFeature(entities)],
})
export class SocialModule {}
