import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { AuthenticatedSocket } from 'src/chat/types/authenticated-socket.type';
import { Socket } from 'socket.io';
import { GameDataDto } from './dto/game.data.dto';
import { ConsultDataDto } from './dto/consult.data.dto';

// TODO make pontuation logic
@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
})
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection {
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(private readonly gameService: GameService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('player1')
  handlePlayer1(
    @MessageBody() data: GameDataDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    this.gameService.setPlayer1(data, socket.id);
    this.server
      .to(`${data.matchId}`)
      .emit('game-data', this.gameService.allData(data.matchId));
  }

  @SubscribeMessage('player2')
  handlePlayer2(
    @MessageBody() data: GameDataDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    this.gameService.setPlayer2(data, socket.id);
    this.server
      .to(`${data.matchId}`)
      .emit('game-data', this.gameService.allData(data.matchId));
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() matchId: string,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    //console.log('SOKECT ROOM IS HERE');
    // console.log(matchId);
    socket.join(matchId);
  }

  @SubscribeMessage('ready')
  setReady(
    @MessageBody() data: ConsultDataDto,
    @ConnectedSocket() socket: Socket,
  ) {
    // check correct way
    this.gameService.setCallback((to, ev, d) => {
      this.server.to(to).emit(ev, d);
    });

    this.gameService.setReady(data, socket.id);
    this.server
      .to(`${data.matchId}`)
      .emit('is-ready', this.gameService.isPlayersReady(data.matchId));
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`Client disconnected from chat socket: ${socket.id}`);
  }

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    console.log(socket.rooms);
  }
}
