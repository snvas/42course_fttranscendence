import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionEntity, UserEntity } from '../db/entities';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { toDataURL, toFileStream } from 'qrcode';
import { OAuth2User, OneTimePassword } from './index';
import { plainToClass } from 'class-transformer';
import { Oauth2UserDto } from '../user/models/oauth2-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async loginUser(user: Omit<OAuth2User, 'id'>): Promise<OAuth2User> {
    this.logger.debug(`### OAuth2 user: ${JSON.stringify(user)}`);

    const userEntity: UserEntity = plainToClass(UserEntity, user);
    const databaseUser: UserEntity | null = await this.userService.findByEmail(
      user.email,
    );

    this.logger.debug(
      `### Current Database User: ${JSON.stringify(databaseUser)}`,
    );
    if (databaseUser) {
      await this.userService.update(databaseUser);
      return plainToClass(Oauth2UserDto, databaseUser);
    }

    this.logger.log(`### User not found. Creating new user`);
    const newUser: UserEntity = await this.userService.create(userEntity);
    return plainToClass(Oauth2UserDto, await this.userService.save(newUser));
  }

  //Create new session for the two factor authenticated user, using express-session
  async login2FAUser(req: Request, res: Response): Promise<void> {
    const user: OAuth2User = req.user as OAuth2User;

    req.logIn({ ...user, otpValidated: true }, function (err: any) {
      if (err) {
        throw new InternalServerErrorException('Error on logIn with 2FA');
      }
      return res
        .status(201)
        .json({ message: 'Two-factor authentication validated' });
    });

    this.logger.log(`### User [${user.id}] logged in with 2FA successfully`);
  }

  async logoutUser(user: OAuth2User, session: any): Promise<void> {
    if (session) {
      session.destroy();
    }
    if (user.otpValidated) {
      await this.invalidateOTP(user.id);
    }

    this.logger.log(`### User [${user.id}] logged out successfully`);
  }

  async validateUniqueSession(
    userId: number,
    currentSessionId: string,
  ): Promise<void> {
    const sessions: SessionEntity[] = await this.sessionRepository.find();

    sessions.forEach((session) => {
      const sessionUserId: number = JSON.parse(session.json).passport.user.id;
      if (sessionUserId === userId && session.id !== currentSessionId) {
        this.logger.verbose(`### User [${userId}] already has another session`);
        throw new NotAcceptableException('User already has another session');
      }
    });
  }

  async destroyOldSessions(
    userId: number,
    currentSessionId: string,
  ): Promise<void> {
    const sessions: SessionEntity[] = await this.sessionRepository.find();

    for (const session of sessions) {
      const sessionUserId: number = JSON.parse(session.json).passport.user.id;

      if (sessionUserId === userId && session.id !== currentSessionId) {
        this.logger.verbose(
          `### Destroying session [${session.id}] for user [${userId}] | current session id [${currentSessionId}]`,
        );
        await this.sessionRepository.delete(session.id);
      }
    }
  }

  async enable2FA(user: OAuth2User, otp: OneTimePassword): Promise<void> {
    if (user.otpEnabled) {
      this.logger.log(`### User [${user.id}] already enabled OTP`);
      return;
    }

    if (!this.is2FACodeValid(otp.code, user.otpSecret!)) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.userService.enable2FA(user.id);

    this.logger.log(`### User [${user.id}] enabled 2FA successfully`);
  }

  async disable2FA(user: OAuth2User): Promise<void> {
    if (!user.otpEnabled) {
      throw new BadRequestException('OTP already disabled');
    }

    await this.userService.disable2FA(user.id);
    this.logger.log(`### User [${user.id}] disabled 2FA successfully`);
  }

  async validateOTP(user: OAuth2User, otp: OneTimePassword): Promise<void> {
    if (user.otpValidated) {
      this.logger.log(`### User [${user.id}] already validated OTP`);
      return;
    }

    if (!this.is2FACodeValid(otp.code, user.otpSecret!)) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.userService.validateOTP(user.id);
    this.logger.log(`### User [${user.id}] validated OTP successfully`);
  }

  async invalidateOTP(id: number): Promise<void> {
    await this.userService.invalidateOTP(id);
    this.logger.log(`### User [${id}] invalidated OTP successfully`);
  }

  public async add2FASecret(id: number, secret: string): Promise<void> {
    await this.userService.add2FASecret(id, secret);
    this.logger.log(`### User [${id}] added 2FA secret successfully`);
  }

  public is2FACodeValid(code: string, secret: string): boolean {
    return authenticator.verify({
      token: code,
      secret: secret,
    });
  }

  public async generate2FASecret(id: number, email: string): Promise<string> {
    const secret: string = authenticator.generateSecret();
    const otpAuthUrl: string = authenticator.keyuri(
      email,
      String(
        this.configService.get<string>('APP_TWO_FACTOR_AUTHENTICATION_NAME'),
      ),
      secret,
    );

    this.logger.log(`### User [${id}] has generated 2FA secret successfully`);

    await this.add2FASecret(id, secret);

    this.logger.log(`### User [${id}] has added 2FA secret successfully`);

    return otpAuthUrl;
  }

  public async pipeQrCodeStream(
    stream: Response,
    otpauthUrl: string,
  ): Promise<void> {
    //toDataURL()
    this.logger.verbose(`### Generating QR Code for ${otpauthUrl}`);
    return toFileStream(stream, otpauthUrl);
  }

  public async qrCodeToDataURL(otpAuthUrl: string): Promise<string> {
    return await toDataURL(otpAuthUrl);
  }

  async validateUser(id: number): Promise<OAuth2User> {
    const user: UserEntity | null = await this.userService.findById(id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return plainToClass(Oauth2UserDto, user);
  }
}
