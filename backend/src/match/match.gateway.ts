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

  constructor(private readonly playerService: PlayerStatusService) {}

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

  //TODO:
  // Enviar status Waiting ao procurar partida, Playing ao começar partida, e Online quando terminar
  // Os dois últimos talvez podem ser enviados através de métodos HTTP para o match making
  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.START_MATCH_MAKING)
  async startMatchMaking(
    @MessageBody() message: PlayerStatusDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    if (message.status !== 'waiting_match') {
      throw new WsException('Invalid status');
    }

    await this.playerService.setPlayerStatus(socket, message.status);
    const playersStatus: PlayerStatusDto[] =
      await this.playerService.getPlayersStatus();
    this.server.emit(socketEvent.PLAYERS_STATUS, playersStatus);
  }

  @UseGuards(WsAuthenticatedGuard)
  @SubscribeMessage(socketEvent.CANCEL_MATCH_MAKING)
  async cancelMatchMaking(
    @MessageBody() message: PlayerStatusDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    if (message.status !== 'online') {
      throw new WsException('Invalid status');
    }

    await this.playerService.setPlayerStatus(socket, message.status);
    const playersStatus: PlayerStatusDto[] =
      await this.playerService.getPlayersStatus();
    this.server.emit(socketEvent.PLAYERS_STATUS, playersStatus);
  }
}
