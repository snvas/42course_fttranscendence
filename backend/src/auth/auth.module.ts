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
import { UserModule } from '../user/user.module';
import { ProfileModule } from '../profile/profile.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    FortyTwoStrategy,
    GoogleStrategy,
    UserAuthenticatedGuard,
    FortyTwoAuthGuard,
    GoogleAuthGuard,
    SessionSerializer,
    AuthService,
  ],
  imports: [TypeOrmModule.forFeature(entities), UserModule, ProfileModule],
  exports: [AuthService, UserAuthenticatedGuard],
})
export class AuthModule {}
