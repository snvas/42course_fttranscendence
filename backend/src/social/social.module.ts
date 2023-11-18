import { Module } from '@nestjs/common';
import { BlockService } from './services/block.service';
import { FriendService } from './services/friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { SocialController } from './social.controller';
import { StatusModule } from '../status/status.module';
import { ProfileModule } from '../profile/profile.module';
import { SocialGateway } from './social.gateway';

@Module({
  controllers: [SocialController],
  providers: [BlockService, FriendService, SocialGateway],
  imports: [TypeOrmModule.forFeature(entities), StatusModule, ProfileModule],
  exports: [BlockService, FriendService],
})
export class SocialModule {}
