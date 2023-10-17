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
import { AuthenticatedSocket } from './types/authenticated-socket.type';
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';
import { ConversationDto } from './models/conversation.dto';
import { PrivateMessageDto } from './models/private-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.log(`### Client connected: ${socket.id}`);

    if (!this.chatService.isConnectionAuthenticated(socket)) {
      return;
    }

    this.logger.verbose(
      `Authenticated user: ${JSON.stringify(socket.request.user)}`,
    );

    await this.chatService.setPlayerStatus(socket, 'online');

    this.server.emit(
      'playersStatus',
      await this.chatService.getPlayersStatus(),
    );
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.log(`Client disconnected: ${socket.id}`);

    if (!this.chatService.isConnectionAuthenticated(socket)) {
      return;
    }

    await this.chatService.removePlayerStatus(socket);

    socket.broadcast.emit(
      'playersStatus',
      await this.chatService.getPlayersStatus(),
    );
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage('sendPrivateMessage')
  async handlePrivateMessage(
    @MessageBody() message: PrivateMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<PrivateMessageDto | null> {
    try {
      const receiverSocket: string | undefined =
        await this.chatService.getPlayerSocketId(message.receiver.id);

      const privateMessage: PrivateMessageDto =
        await this.chatService.handlePrivateMessage(message);

      if (receiverSocket) {
        socket.to(receiverSocket).emit('receivePrivateMessage', privateMessage);
      }

      //await new Promise((resolve) => setTimeout(resolve, 5000));

      return privateMessage;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    // const messageDto: GroupMessageDto =
    //  messageDto await this.chatService.handleGroupMessage(socket, message);

    const conversationDto: ConversationDto = {
      id: 1,
      message: message,
      createdAt: new Date(),
      sender: {
        id: 1,
        nickname: 'Teste',
      },
    };

    this.server.emit('message', conversationDto);
  }
}
