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
import { Logger, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket.type';
import { WsAuthenticatedGuard } from '../ws/guards/ws-authenticated.guard';
import { PrivateMessageDto } from './models/private/private-message.dto';
import { GroupMessageDto } from './models/group/group-message.dto';
import { socketEvent } from '../ws/ws-events';
import { PrivateChatService } from './services/private-chat.service';
import { GroupChatService } from './services/group-chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private readonly privateChatService: PrivateChatService,
    private readonly groupChatService: GroupChatService,
  ) {}

  async getServer(): Promise<Server> {
    return this.server;
  }

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`### Client connected to chat socket: [${socket.id}]`);
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`Client disconnected from chat socket: [${socket.id}]`);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.SEND_PRIVATE_MESSAGE)
  async handlePrivateMessage(
    @MessageBody() message: PrivateMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<PrivateMessageDto | null> {
    return await this.privateChatService.handlePrivateMessage(message, socket);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.SEND_GROUP_MESSAGE)
  async handleGroupMessage(
    @MessageBody() message: GroupMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<GroupMessageDto | null> {
    return await this.groupChatService.handleGroupMessage(message, socket);
  }
}
