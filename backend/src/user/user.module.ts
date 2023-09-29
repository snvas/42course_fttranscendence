import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '../db/entities';
import { ProfileService } from '../profile/profile.service';
import { AvatarService } from '../avatar/avatar.service';

@Module({
  controllers: [],
  providers: [UserService, ProfileService, AvatarService],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserService],
})
export class UserModule {}
