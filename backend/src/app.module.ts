import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAuthenticatedGuard } from './auth';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import AvatarModule from './avatar/avatar.module';
import { dataSourceOptions } from './db/data-source-cli';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MatchModule } from './match/match.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AvatarModule,
    ProfileModule,
    ChatModule,
    ChatModule,
    GameModule,
    MatchModule,
    SocialModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    PassportModule.register({ session: true }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: 'APP_GUARD',
      useFactory: async (
        configService: ConfigService,
        userAuthGuard: UserAuthenticatedGuard,
      ): Promise<UserAuthenticatedGuard | null> =>
        configService.get<string>('APP_OAUTH2_ENABLED') === 'true'
          ? userAuthGuard
          : null,
      inject: [ConfigService, UserAuthenticatedGuard],
    },
  ],
})
export class AppModule {}
