import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthenticatedGuard } from '../auth/guards/ws-authenticated.guard';
import { AuthenticatedSocket } from './types/authenticated-socket';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsAuthenticatedGuard)
  handleConnection(socket: AuthenticatedSocket) {
    console.log(`Client connected: ${socket.id}`);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage('test')
  handleTest(
    @MessageBody() data: string,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    this.logger.log(
      `### Received test message: ${data} from socket: ${socket.id}`,
    );

    this.logger.verbose(
      `### Sending test message: ${JSON.stringify(
        socket.request.user,
      )} to all clients`,
    );

    this.server.emit('test', data);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const name = this.chatService.getClientName(socket.id);
    const chat = {
      name,
      message,
    };
    this.server.emit('chat', chat);
    return chat;
  }

  @SubscribeMessage('createChat')
  async create(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = this.chatService.create(createChatDto, socket.id);

    this.server.emit('chat', chat);
    return chat;
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.chatService.identify(name, socket.id);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() socket: Socket,
  ) {
    const name = this.chatService.getClientName(socket.id);

    //send to everyone except the sender
    socket.broadcast.emit('typing', { name, isTyping });
  }
}
