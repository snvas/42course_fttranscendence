import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2User } from '../../user/interfaces/fortytwo-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('APP_GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('APP_GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('APP_GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    this.logger.verbose(
      `### Validating user ${profile.id} with google strategy`,
    );
    const { id, displayName, emails, otpEnabled, otpSecret } = profile;

    const user: OAuth2User = await this.authService.loginUser({
      id,
      displayName,
      email: emails[0].value,
      otpEnabled,
      otpSecret,
      otpValidated: false,
    });
    return user || null;
  }
}
