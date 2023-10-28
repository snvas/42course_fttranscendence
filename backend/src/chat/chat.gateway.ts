import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket.type';
import { WsAuthenticatedGuard } from './guards/ws-authenticated.guard';
import { PrivateMessageDto } from './models/private/private-message.dto';
import { GroupMessageDto } from './models/group/group-message.dto';
import { socketEvent } from '../ws/ws-events';
import { PlayerStatusService } from './services/player-status.service';
import { PrivateChatService } from './services/private-chat.service';
import { GroupChatService } from './services/group-chat.service';

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

  constructor(
    private readonly playerService: PlayerStatusService,
    private readonly privateChatService: PrivateChatService,
    private readonly groupChatService: GroupChatService,
  ) {}

  async getServer(): Promise<Server> {
    return this.server;
  }

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`### Client connected to chat socket: ${socket.id}`);
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`Client disconnected from chat socket: ${socket.id}`);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.SEND_PRIVATE_MESSAGE)
  async handlePrivateMessage(
    @MessageBody() message: PrivateMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<PrivateMessageDto | null> {
    try {
      const receiverSocket: AuthenticatedSocket | undefined =
        await this.playerService.getPlayerSocket(message.receiver.id);

      const privateMessage: PrivateMessageDto =
        await this.privateChatService.handlePrivateMessage(message);

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
        await this.groupChatService.handleGroupMessage(socket, message);

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
