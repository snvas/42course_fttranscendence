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
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket.type';
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';
import { PrivateMessageDto } from './models/private-message.dto';
import { GroupMessageDto } from './models/group-message.dto';
import { socketEvent } from '../utils/socket-events';

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

  async getServer(): Promise<Server> {
    return this.server;
  }

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

    const rooms: string[] = await this.chatService.getPlayerChatRooms(socket);

    socket.join(rooms);

    this.server.emit(
      socketEvent.PLAYERS_STATUS,
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
      socketEvent.PLAYERS_STATUS,
      await this.chatService.getPlayersStatus(),
    );
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.SEND_PRIVATE_MESSAGE)
  async handlePrivateMessage(
    @MessageBody() message: PrivateMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<PrivateMessageDto | null> {
    try {
      const receiverSocket: AuthenticatedSocket | undefined =
        await this.chatService.getPlayerSocket(message.receiver.id);

      const privateMessage: PrivateMessageDto =
        await this.chatService.handlePrivateMessage(message);

      if (receiverSocket) {
        socket
          .to(receiverSocket?.id)
          .emit(socketEvent.RECEIVE_PRIVATE_MESSAGE, privateMessage);
      }

      return privateMessage;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.SEND_GROUP_MESSAGE)
  async handleGroupMessage(
    @MessageBody() message: GroupMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<GroupMessageDto | null> {
    try {
      const groupMessage: GroupMessageDto =
        await this.chatService.handleGroupMessage(socket, message);

      if (groupMessage.groupChat.id) {
        socket
          .to(`${groupMessage.groupChat.id}`)
          .emit(socketEvent.RECEIVE_GROUP_MESSAGE, groupMessage);
      }

      return groupMessage;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.debug(
          `Unauthorized group message from sender [${message.sender.id}]`,
        );
      } else {
        this.logger.error(error);
      }
      return null;
    }
  }
}
