import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Positions } from './types/positions.type';
import { GameService } from './game.service';
import { AuthenticatedSocket } from 'src/chat/types/authenticated-socket.type';
import { Socket } from 'socket.io';

// create rooms, this room name is player id
@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect{
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(private readonly gameService:GameService){}
  @WebSocketServer()
  server: Server;
 
  @SubscribeMessage('player1')
  handlePlayer1(@MessageBody() data: Positions) {
    this.gameService.setPlayer1(data);
    let tt = this.gameService.allData();
    console.log(tt)
    this.server.emit('game-data', tt);
  }

  @SubscribeMessage('player2')
  handlePlayer2(@MessageBody() data: Positions) {
    this.gameService.setPlayer2(data);
    console.log("player2")
    this.server.emit('game-data', this.gameService.allData());
  }

  @SubscribeMessage('ready')
  setReady(@ConnectedSocket() socket: Socket) {
    this.gameService.setReady(socket.id);
    console.log(String(socket.id))
    this.server.emit('is-ready', this.gameService.isPlayersReady());
  }

  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    this.logger.verbose(`Client disconnected from chat socket: ${socket.id}`);
    this.server.emit('is-ready', this.gameService.playerDisconected(socket.id));
  }

  @SubscribeMessage('ball')
  handleBall(
    @MessageBody() data: Positions,
    @ConnectedSocket() socket: Socket)
  {
    if (this.gameService.ballValidation(socket.id)) {
      this.gameService.setBall(data);
      this.server.emit('game-data', this.gameService.ballData());
    }
  }
}
