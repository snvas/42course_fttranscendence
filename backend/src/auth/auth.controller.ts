import {
  Body,
  ClassSerializerInterceptor,
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
  UseInterceptors,
} from '@nestjs/common';
import { FortyTwoAuthGuard, Public, TwoFactorAuthentication } from './index';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { OneTimePasswordDto } from './models/one-time-password.dto';
import { ResponseMessageDto } from './models/response-message.dto';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { ProfileService } from '../profile/profile.service';

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
  async login(): Promise<void> {
    return;
  }

  @Public()
  @UseGuards(FortyTwoAuthGuard)
  @Get('42/redirect')
  @HttpCode(HttpStatus.OK)
  async redirect(
    @Req() { user }: { user: FortyTwoUserDto },
    @Res() res: Response,
  ): Promise<void> {
    const redirectUrl: string =
      this.configService.get<string>('APP_OAUTH2_REDIRECT') ||
      'http://localhost:3001';

    if (this.configService.get<string>('APP_ENABLE_REACT_FRONT')) {
      const hasProfile: boolean = await this.profileService.userHasProfile(
        user,
      );

      if (!hasProfile) {
        res.redirect(redirectUrl + '/welcome');
      }

      if (user.otpEnabled) {
        res.redirect(redirectUrl + '/validate-otp');
      }
    }

    res.redirect(redirectUrl);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() { user }: { user: FortyTwoUserDto },
    @Session() session: Record<string, any>,
  ): Promise<ResponseMessageDto> {
    await this.authService.logoutUser(user, session);
    return { message: 'Logout successful' };
  }

  @Get('session')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async session(
    @Req() { user }: { user: FortyTwoUserDto },
    @Session() session: Record<string, any>,
  ): Promise<FortyTwoUserDto> {
    this.logger.debug(`### user session: ${JSON.stringify(session)}`);
    return plainToClass(FortyTwoUserDto, user);
  }

  @TwoFactorAuthentication()
  @Get('2fa/session')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async session2fa(
    @Req() { user }: { user: FortyTwoUserDto },
    @Session() session: Record<string, any>,
  ): Promise<FortyTwoUserDto> {
    this.logger.debug(`### user session: ${JSON.stringify(session)}`);
    return plainToClass(FortyTwoUserDto, user);
  }

  @Post('2fa/turn-on')
  async turnOn2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Body() otp: OneTimePasswordDto,
  ): Promise<any> {
    await this.authService.enable2FA(req.user as FortyTwoUserDto, otp);
    await this.authService.login2FAUser(req, res); //Express-Session Callback
  }

  @Post('2fa/turn-off')
  @HttpCode(HttpStatus.CREATED)
  async turnOff2FA(
    @Req() { user }: { user: FortyTwoUserDto },
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
    await this.authService.validateOTP(req.user as FortyTwoUserDto, otp);
    await this.authService.login2FAUser(req, res); //Express-Session Callback
  }

  @Get('2fa/qr-code')
  async qrCode2FA(@Req() { user }: { user: FortyTwoUserDto }): Promise<string> {
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
