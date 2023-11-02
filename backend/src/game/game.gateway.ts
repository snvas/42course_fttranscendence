import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Positions } from './types/positions.type';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService:GameService){}
  @WebSocketServer()
  server: Server;
 
  @SubscribeMessage('player1')
  handlePlayer1(@MessageBody() data: Positions) {
    this.gameService.setPlayer1(data);
    this.server.emit('game-data', this.gameService.allData());
  }

  @SubscribeMessage('player2')
  handlePlayer2(@MessageBody() data: Positions) {
    this.gameService.setPlayer2(data);
    this.server.emit('game-data', this.gameService.allData());
  }

  @SubscribeMessage('ball')
  handleBall(@MessageBody() data: Positions) {
    this.gameService.setBall(data);
    this.server.emit('game-data', this.gameService.allData());
  }
}
