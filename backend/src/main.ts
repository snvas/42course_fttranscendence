import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeormStore } from 'connect-typeorm';
import { DataSource } from 'typeorm';
import { SessionEntity } from './db/entities';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const configService: ConfigService<Record<string, any>> = new ConfigService();
  const logger: Logger = new Logger(bootstrap.name);
  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    cors: {
      origin: configService.get<string>('APP_CORS_ORIGIN') || '*',
      methods: 'GET,PUT,POST,DELETE',
      credentials: true,
    },
  });
  app.setGlobalPrefix('api');
  app.use(
    session({
      name: configService.get<string>('APP_SESSION_ID') || 'randomId',
      secret: configService.get<string>('APP_SESSION_SECRET') || 'randomSecret',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge:
          Number(configService.get<number>('APP_SESSION_COOKIE_MAX_AGE')) ||
          86400000,
      },
      store: new TypeormStore({
        cleanupLimit:
          Number(configService.get<number>('APP_SESSION_CLEANUP_LIMIT')) || 0,
      }).connect(app.get(DataSource).getRepository(SessionEntity)),
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(Number(configService.get<number>('APP_PORT')) || 3000);

  logger.log(`### Application is running on: ${await app.getUrl()}`);
}

bootstrap();
