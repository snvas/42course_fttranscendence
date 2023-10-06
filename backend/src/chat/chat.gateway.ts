import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket';
import { WsAuthenticatedGuard } from '../auth/guards/ws-authenticated.guard';
import { ChatMessageDto } from './dto/chat-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsAuthenticatedGuard)
  handleConnection(@ConnectedSocket() socket: AuthenticatedSocket) {
    this.logger.log(`### Client connected: ${socket.id}`);

    if (!socket.request.user) {
      this.logger.log(`### User not authenticated: ${socket.id}`);
      socket.emit('unauthorized', 'User not authenticated');
    }

    this.logger.verbose(
      `Authenticated user: ${JSON.stringify(socket.request.user)}`,
    );
    this.chatService.setOnlineUser(socket);

    this.server.emit('onlineUsers', this.chatService.getOnlineUsers());
  }

  @UseGuards(WsAuthenticatedGuard)
  handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.chatService.removeOnlineUser(socket);

    socket.broadcast.emit('onlineUsers', this.chatService.getOnlineUsers());
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const messageDto: ChatMessageDto = await this.chatService.saveMessage(
      socket,
      message,
    );

    this.server.emit('message', messageDto);
  }
}
