// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { OAuth2User } from '../index';
import { faker } from '@faker-js/faker';

//This class is used to do 42 OAuth2 authentication
@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(FortyTwoStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('APP_OAUTH2_CLIENT_ID'),
      clientSecret: configService.get<string>('APP_OAUTH2_CLIENT_SECRET'),
      callbackURL: configService.get<string>('APP_OAUTH2_CALLBACK_URL'),
    });
  }

  async authenticate(req: any, options: any) {
    if (this.configService.get<boolean>('APP_MOCK_OAUTH2_LOGIN')) {
      if (req.path.endsWith('login')) {
        (this as any).redirect('/api/auth/42/redirect');
        return;
      }
      (this as any).success(
        await this.authService.loginUser(this.generateFakeUser()),
      );
      return;
    }
    super.authenticate(req, options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<OAuth2User> {
    this.logger.verbose(`### Validating user ${profile.id} with 42 strategy`);
    const { displayName, emails, otpEnabled, otpSecret } = profile;

    const user: OAuth2User =
      this.configService.get<string>('APP_MOCK_42_USERS') === 'true'
        ? await this.authService.loginUser(this.generateFakeUser())
        : await this.authService.loginUser({
            displayName,
            email: emails[0].value,
            otpEnabled,
            otpSecret,
            otpValidated: false,
          });
    return user || null;
  }

  private generateFakeUser(): Omit<OAuth2User, 'id'> {
    return {
      displayName: faker.person.fullName(),
      email: faker.internet.email(),
      otpEnabled: false,
      otpValidated: false,
    };
  }
}
