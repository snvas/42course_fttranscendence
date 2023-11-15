import { 
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { ConsultData, GameData, Positions } from './types/positions.type';
import { GameService } from './game.service';
import { AuthenticatedSocket } from 'src/chat/types/authenticated-socket.type';
import { Socket } from 'socket.io';
import { MatchGameService } from 'src/match/services/match-game.service';

// TODO make pontuation logic
@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection{
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService:GameService,
    private readonly matchGameService:MatchGameService
  ){}
  @WebSocketServer()
  server: Server;
  
  @SubscribeMessage('player1')
  handlePlayer1(
  @MessageBody() data: GameData,
  @ConnectedSocket() socket: AuthenticatedSocket)
  {
    this.gameService.setPlayer1(data, socket.id);
    this.server
      .to(`${data.matchId}`)
      .emit('game-data', this.gameService.allData(data.matchId));
  }

  @SubscribeMessage('player2')
  handlePlayer2(
  @MessageBody() data: GameData,
  @ConnectedSocket() socket: AuthenticatedSocket)
  {
    this.gameService.setPlayer2(data, socket.id);
    this.server
      .to(`${data.matchId}`)
      .emit('game-data', this.gameService.allData(data.matchId));
  }

  @SubscribeMessage('p2')
  pointPlayer2(@MessageBody() matchId: string) {
    this.matchGameService.savePoints(matchId, 'p2');
  }

  @SubscribeMessage('p1')
  pointPlayer1(@MessageBody() matchId: string) {
    this.matchGameService.savePoints(matchId, 'p1');
  }

  @SubscribeMessage('ready')
  setReady(
    @MessageBody() data: ConsultData,
    @ConnectedSocket() socket: Socket) {
    this.gameService.setReady(data, socket.id);
    this.server
      .to(`${data.matchId}`)
      .emit('is-ready', this.gameService.isPlayersReady(data.matchId));
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {

    this.logger.verbose(`Client disconnected from chat socket: ${socket.id}`);
    this.server.emit('is-ready', this.gameService.playerDisconected(String(socket.rooms),socket.id));
  }

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    console.log(socket.rooms);
    this.gameService.reConnect(String(socket.rooms), socket.id);
  }

  @SubscribeMessage('ball')
  handleBall(
    @MessageBody() data: GameData,
    @ConnectedSocket() socket: Socket)
  {
    if (this.gameService.ballValidation(data, socket.id)) {
      this.gameService.setBall(data);
      this.server
        .to(`${data.matchId}`)
        .emit('game-data', this.gameService.allData(data.matchId));
    }
  }
}
