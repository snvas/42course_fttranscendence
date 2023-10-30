import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FortyTwoAuthGuard,
  FortyTwoStrategy,
  SessionSerializer,
  UserAuthenticatedGuard,
} from './index';
import entities from '../db/entities';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { AvatarService } from '../avatar/avatar.service';

@Module({
  controllers: [AuthController],
  providers: [
    UserService,
    AvatarService,
    ProfileService,
    FortyTwoStrategy,
    UserAuthenticatedGuard,
    FortyTwoAuthGuard,
    SessionSerializer,
    AuthService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserAuthenticatedGuard, AvatarService, ProfileService],
})
export class AuthModule {}
