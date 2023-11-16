import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { ProfileService } from '../profile/profile.service';
import { AvatarService } from '../avatar/avatar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { UserService } from '../user/user.service';

@Module({
  providers: [StatusService, ProfileService, AvatarService, UserService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [StatusService],
})
export class StatusModule {}
