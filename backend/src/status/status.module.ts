import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from '../profile/profile.service';
import { UserService } from '../user/user.service';
import AvatarModule from '../avatar/avatar.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  controllers: [],
  providers: [StatusService, ProfileService, UserService],
  exports: [StatusService],
  imports: [TypeOrmModule.forFeature(entities), AvatarModule, ProfileModule],
})
export class StatusModule {}
