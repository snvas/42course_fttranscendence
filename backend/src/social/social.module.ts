import { Module } from '@nestjs/common';
import { StatusService } from '../status/status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { BlockService } from './services/block.service';
import { FriendService } from './services/friend.service';
import { SocialGateway } from './social.gateway';
import { SocialController } from './social.controller';
import { ProfileService } from '../profile/profile.service';
import { UserService } from '../user/user.service';
import { AvatarService } from '../avatar/avatar.service';

@Module({
  controllers: [SocialController],
  providers: [
    SocialController,
    StatusService,
    ProfileService,
    UserService,
    AvatarService,
    BlockService,
    FriendService,
    SocialGateway,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [StatusService, BlockService, FriendService],
})
export class SocialModule {}
