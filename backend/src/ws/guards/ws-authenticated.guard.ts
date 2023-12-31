import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthenticatedSocket } from '../../chat/types/authenticated-socket.type';

//Protect websocket events, except OnGatewayConnection and OnGatewayDisconnect

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  private readonly logger: Logger = new Logger(WsAuthenticatedGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const socket: AuthenticatedSocket = client as AuthenticatedSocket;

    if (
      !client.request.isAuthenticated() ||
      socket.request.user === undefined ||
      socket.request.user.id === undefined
    ) {
      this.logger.verbose(
        `### User is not authenticated for WS, blocking access - socket id: ${socket.id}`,
      );

      socket.emit('unauthorized', 'User not authenticated');
      socket.disconnect();
      return false;
    }

    return true;
  }
}
