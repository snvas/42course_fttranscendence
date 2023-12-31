import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { FortyTwoAuthGuard, Public, TwoFactorAuthentication } from './index';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Oauth2UserDto } from '../user/models/oauth2-user.dto';
import { OneTimePasswordDto } from './models/one-time-password.dto';
import { ResponseMessageDto } from './models/response-message.dto';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { ProfileService } from '../profile/profile.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(FortyTwoAuthGuard)
  @Get('42/login')
  @HttpCode(HttpStatus.NO_CONTENT)
  async fortyTwoLogin(): Promise<void> {
    return;
  }

  @Public()
  @UseGuards(FortyTwoAuthGuard)
  @Get('42/redirect')
  @HttpCode(HttpStatus.OK)
  async fortyTwoRedirect(
    @Req() { user }: { user: Oauth2UserDto },
    @Res() res: Response,
  ): Promise<void> {
    const redirectUrl: string =
      this.configService.get<string>('APP_OAUTH2_REDIRECT') ||
      'http://localhost:3001';

    const hasProfile: boolean = await this.profileService.userHasProfile(user);

    if (!hasProfile) {
      return res.redirect(redirectUrl + '/welcome');
    }

    if (user.otpEnabled) {
      return res.redirect(redirectUrl + '/validate-otp');
    }

    return res.redirect(redirectUrl);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @HttpCode(HttpStatus.NO_CONTENT)
  async googleLogin(): Promise<void> {
    return;
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  @HttpCode(HttpStatus.OK)
  async googleRedirect(
    @Req() { user }: { user: Oauth2UserDto },
    @Res() res: Response,
  ): Promise<void> {
    const redirectUrl: string =
      this.configService.get<string>('APP_OAUTH2_REDIRECT') ||
      'http://localhost:3001';

    const hasProfile: boolean = await this.profileService.userHasProfile(user);

    if (!hasProfile) {
      return res.redirect(redirectUrl + '/welcome');
    }

    if (user.otpEnabled) {
      return res.redirect(redirectUrl + '/validate-otp');
    }

    return res.redirect(redirectUrl);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() { user }: { user: Oauth2UserDto },
    @Session() session: Record<string, any>,
  ): Promise<ResponseMessageDto> {
    await this.authService.logoutUser(user, session);
    return { message: 'Logout successful' };
  }

  @Get('session')
  @HttpCode(HttpStatus.OK)
  async session(
    @Req() { user }: { user: Oauth2UserDto },
    @Session() session: Record<string, any>,
  ): Promise<Oauth2UserDto> {
    this.logger.debug(`### User session: ${JSON.stringify(session)}`);

    return plainToClass(Oauth2UserDto, user);
  }

  @Get('session/unique-validation')
  @HttpCode(HttpStatus.OK)
  async sessionUniqueValidation(
    @Req() req: Request,
    @Session() session: Record<string, any>,
  ): Promise<Oauth2UserDto> {
    this.logger.debug(`### User session: ${JSON.stringify(session)}`);

    const user: Oauth2UserDto = req.user as Oauth2UserDto;

    await this.authService.validateUniqueSession(user.id, req.sessionID);
    return plainToClass(Oauth2UserDto, user);
  }

  @Post('session/destroy-old')
  @HttpCode(HttpStatus.OK)
  async destroyOldSessions(@Req() req: Request): Promise<Oauth2UserDto> {
    this.logger.debug(`### user sessionId: ${JSON.stringify(req.sessionID)}`);

    const user: Oauth2UserDto = req.user as Oauth2UserDto;

    await this.authService.destroyOldSessions(user.id, req.sessionID);
    return plainToClass(Oauth2UserDto, user);
  }

  @TwoFactorAuthentication()
  @Get('2fa/session')
  @HttpCode(HttpStatus.OK)
  async session2fa(
    @Req() { user }: { user: Oauth2UserDto },
    @Session() session: Record<string, any>,
  ): Promise<Oauth2UserDto> {
    this.logger.debug(`### user session: ${JSON.stringify(session)}`);
    return plainToClass(Oauth2UserDto, user);
  }

  @Post('2fa/turn-on')
  async turnOn2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Body() otp: OneTimePasswordDto,
  ): Promise<any> {
    await this.authService.enable2FA(req.user as Oauth2UserDto, otp);
    await this.authService.login2FAUser(req, res); //Express-Session Callback
  }

  @Post('2fa/turn-off')
  @HttpCode(HttpStatus.CREATED)
  async turnOff2FA(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<ResponseMessageDto> {
    await this.authService.disable2FA(user);
    return { message: 'Two-factor authentication disabled' };
  }

  @TwoFactorAuthentication()
  @Post('2fa/validate')
  async validate2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Body() otp: OneTimePasswordDto,
  ): Promise<any> {
    await this.authService.validateOTP(req.user as Oauth2UserDto, otp);
    await this.authService.login2FAUser(req, res); //Express-Session Callback
  }

  @Get('2fa/qr-code')
  async qrCode2FA(@Req() { user }: { user: Oauth2UserDto }): Promise<string> {
    const otpAuthUrl: string = await this.authService.generate2FASecret(
      user.id,
      user.email,
    );
    return this.authService.qrCodeToDataURL(otpAuthUrl);
  }

  // Debug route to check if user is authenticated
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async status(): Promise<ResponseMessageDto> {
    return { message: 'Authenticated' };
  }

  // Debug route to check if it's public
  @Public()
  @Get('public')
  @HttpCode(HttpStatus.OK)
  async public(): Promise<ResponseMessageDto> {
    return { message: '@Public route' };
  }
}
