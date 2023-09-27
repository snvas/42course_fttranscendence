import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(80, {
  cors: {
    origin: 'http://localhost:4200',
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // @UseGuards(AuthenticatedGuard)
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log(payload);
    console.log(client.username);
    console.log(client.request.user);
    client.emit('answer', 'Hello client');
    return payload;
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client.data.username); //console is showing 'test' as it suppose to
    console.log('user connected');
  }
}
