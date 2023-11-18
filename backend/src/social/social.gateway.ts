import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
})
export class SocialGateway {
  @WebSocketServer()
  private readonly server: Server;

  async getServer(): Promise<Server> {
    return this.server;
  }
}
