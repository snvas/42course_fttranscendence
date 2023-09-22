import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { IS_TWO_FACTOR_AUTH } from '../decorators/two-factor-auth.decorator';
import { FortyTwoUser } from '../../user/interfaces/fortytwo-user.interface';

// This class is used to check if user is authenticated, all non-public routes should use this guard
@Injectable()
export class UserAuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(UserAuthenticatedGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    //Get Custom Decorators Metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isTwoFactorAuth: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_TWO_FACTOR_AUTH,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    this.logger.verbose(`### Using UserAuthenticatedGuard for ${request.url}`);

    //Allow if the route is public
    if (isPublic) {
      this.logger.verbose(`### Route is public, allowing access`);
      return true;
    }

    //Block if user not is authenticated.
    if (!request.isAuthenticated()) {
      this.logger.verbose(`### User is not authenticated, blocking access`);
      return false;
    }

    const user: FortyTwoUser = request.user as FortyTwoUser;

    //Allow if user is authenticated and 2FA is not enabled
    if (!request.user.otpEnabled) {
      this.logger.verbose(
        `### User [${user.id}] is authenticated and 2FA is not enabled`,
      );
      return true;
    }

    //Allow if user is authenticated and 2FA is validated
    if (request.user.otpValidated) {
      this.logger.verbose(
        `### User [${user.id}] is authenticated and 2FA is validated`,
      );
      return true;
    }

    //Grant access only to 2FA authentication routes, if user enabled 2FA but is not validated yet
    this.logger.verbose(
      `### Granting access to 2FA authentication routes, because user [${user.id}] is validated but not 2FA authenticated`,
    );
    return isTwoFactorAuth;
  }
}
