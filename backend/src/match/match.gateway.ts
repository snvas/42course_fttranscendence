import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from '../chat/types/authenticated-socket.type';
import { WsAuthenticatedGuard } from '../chat/guards/ws-authenticated.guard';
import { socketEvent } from '../ws/ws-events';
import { PlayerStatusDto } from '../chat/models/player/player-status.dto';
import { PlayerStatusService } from '../profile/services/player-status.service';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
  namespace: 'pong',
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger: Logger = new Logger(MatchGateway.name);

  constructor(private readonly playerStatusService: PlayerStatusService) {}

  async getServer(): Promise<Server> {
    return this.server;
  }

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`### Client connected to match socket: ${socket.id}`);
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`Client disconnected from match socket: ${socket.id}`);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.START_MATCH_MAKING)
  async startMatchMaking(
    @MessageBody() message: PlayerStatusDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    await this.handleMatchStatus(message, socket, 'waiting_match');
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.CANCEL_MATCH_MAKING)
  async cancelMatchMaking(
    @MessageBody() message: PlayerStatusDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    await this.handleMatchStatus(message, socket, 'online');
  }

  private async handleMatchStatus(
    message: PlayerStatusDto,
    socket: AuthenticatedSocket,
    status: 'waiting_match' | 'online',
  ): Promise<void> {
    if (message.status !== status) {
      throw new WsException('Invalid status');
    }

    await this.playerStatusService.setPlayerStatus(socket, message.status);
    const playersStatus: PlayerStatusDto[] =
      await this.playerStatusService.getPlayersStatus();
    this.server.emit(socketEvent.PLAYERS_STATUS, playersStatus);
  }
}
