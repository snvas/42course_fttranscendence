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

@Module({
  controllers: [AuthController],
  providers: [
    UserService,
    FortyTwoStrategy,
    UserAuthenticatedGuard,
    FortyTwoAuthGuard,
    SessionSerializer,
    AuthService,
  ],
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [UserAuthenticatedGuard],
})
export class AuthModule {}
