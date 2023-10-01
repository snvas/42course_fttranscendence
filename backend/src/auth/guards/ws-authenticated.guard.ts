import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthenticatedGuard.name);

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const request = client.request;

    if (!request.isAuthenticated()) {
      this.logger.verbose(
        `### User is not authenticated for WS, blocking access`,
      );
      return false;
    }

    return true;
  }
}
