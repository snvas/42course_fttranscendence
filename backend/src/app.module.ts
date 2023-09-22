import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import entities from './db/entities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAuthenticatedGuard } from './auth';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'root',
        password: configService.get<string>('DB_PASSWORD') || 'root',
        database: configService.get<string>('DB_NAME') || 'transcendence',
        entities: entities,
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ session: true }),
  ],
  controllers: [],
  providers: [
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
