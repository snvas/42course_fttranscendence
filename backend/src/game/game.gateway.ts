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
import { GameDataDto } from './dto/game.data.dto';
import { ConsultDataDto } from './dto/consult.data.dto';

/**
 * The game gateway that handles the communication between the client and the game logic.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGIN,
    credentials: true,
  },
})
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection {
  private readonly logger: Logger = new Logger(GameGateway.name);

  /**
   * Constructs a new instance of the GameGateway class.
   * @param gameService The game service used for communication with the game logic.
   */
  constructor(private readonly gameService: GameService) {
    this.gameService.setCallback((to, ev, d) => {
      this.server.to(to).emit(ev, d);
    });
  }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('player1')
  /**
   * Handles the player 1 event.
   *
   * @param data - The game data.
   * @param socket - The connected socket.
   */
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
  /**
   * Handles the player 2 connection and emits game data to all connected clients.
   * @param data - The game data received from the client.
   * @param socket - The connected socket of the player 2.
   */
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
  /**
   * Handles the join event for a match.
   * @param matchId - The ID of the match to join.
   * @param socket - The authenticated socket connection.
   */
  handleJoin(
    @MessageBody() matchId: string,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    socket.join(matchId);
  }

  @SubscribeMessage('ready')
  /**
   * Sets the player's readiness for the game.
   *
   * @param data - The ConsultDataDto containing the necessary data for the game.
   * @param socket - The connected socket of the player.
   */
  setReady(
    @MessageBody() data: ConsultDataDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
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

  @SubscribeMessage('finish')
  async finishedMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    await this.gameService.finishMatch(data.matchId);
    socket.leave(data.matchId);
  }

  @SubscribeMessage('abandon-match')
  async handleAbandonMatch(
    @MessageBody() data: { matchId: string; by: 'p1' | 'p2' },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    await this.gameService.abandonMatch(data.matchId, data.by);
    this.server.to(`${data.matchId}`).emit('abandon-match', data.by);
    socket.leave(data.matchId);
  }

  /**
   * Handles the disconnection of a client from the chat socket.
   * @param socket - The authenticated socket that disconnected.
   * @returns A promise that resolves when the disconnection is handled.
   */
  async handleDisconnect(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    console.log(`Handle FORCE disconnection`);
    this.gameService.forceDesconnect(socket.id);
    this.logger.verbose(`Client disconnected from chat socket: ${socket.id}`);
  }

  async handleConnection(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<void> {
    console.log(socket.rooms);
  }
}
