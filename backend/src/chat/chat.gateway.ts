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
import { WsAuthenticatedGuard } from '../auth/guards/ws-authenticated.guard';
import { AuthenticatedSocket } from './types/authenticated-socket';
import { ChatMessage } from './entities/chat-message.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsAuthenticatedGuard)
  handleConnection(@ConnectedSocket() socket: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${socket.id}`);
    this.logger.log(`User: ${JSON.stringify(socket.request.user)}`);
    this.chatService.setOnlineUser(socket);
    //socket.emit('onlineUsers', this.chatService.getOnlineUsers());
  }

  handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.chatService.removeOnlineUser(socket);
    //socket.emit('onlineUsers', this.chatService.getOnlineUsers());
  }

  //@UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const chat: ChatMessage = {
      name: socket.request.user.username,
      message,
      timestamp: new Date().toLocaleString(),
    };
    this.chatService.saveMessage(chat);
    this.server.emit('message', chat);
  }

  //Salvar e pegar no banco de dados depois
  @SubscribeMessage('chatHistory')
  findAll() {
    return this.chatService.findAll();
  }
}
