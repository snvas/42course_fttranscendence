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
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';

@Module({
  controllers: [AuthController],
  providers: [
    UserService,
    AvatarService,
    ProfileService,
    FortyTwoStrategy,
    UserAuthenticatedGuard,
    WsAuthenticatedGuard,
    FortyTwoAuthGuard,
    SessionSerializer,
    AuthService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserAuthenticatedGuard, WsAuthenticatedGuard],
})
export class AuthModule {}
