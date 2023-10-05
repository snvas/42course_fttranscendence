import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthenticatedSocket } from '../../chat/types/authenticated-socket';

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  private readonly logger: Logger = new Logger(WsAuthenticatedGuard.name);

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const socket: AuthenticatedSocket = client as AuthenticatedSocket;

    if (!client.request.isAuthenticated()) {
      this.logger.verbose(
        `### User is not authenticated for WS, blocking access - socket id: ${socket.id}`,
      );

      socket.emit('unauthorized', 'User not authenticated');

      return false;
    }

    return true;
  }
}
