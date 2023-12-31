import type { Socket } from 'socket.io-client';
import type { ConsultDataDto, GameDataDto } from '$lib/dtos';
import { socketEvent } from './SocketsEvents';
import { chatService } from './ChatService';

class GameService {
	private readonly socket: Socket;

	constructor() {
		this.socket = chatService.getSocket();
	}

	public connect(): void {
		this.socket.connect();
	}

	public getSocket(): Socket {
		return this.socket;
	}

	public disconnect(): void {
		this.socket?.disconnect();
	}

	public emitMessage(message: string): void {
		this.socket?.emit('message', message);
	}

	public emitBall(message: GameDataDto): Promise<GameDataDto> {
		return new Promise<GameDataDto>((resolve): void => {
			this.socket?.emit(socketEvent.GAME_BALL, message, (ack: GameDataDto): void => {
				resolve(ack);
			});
		});
	}

	public emitPlayer(p: string, message: GameDataDto) {
		console.log('Emit player here: ', p);
		if (p == 'p1') {
			return new Promise<GameDataDto>((resolve): void => {
				this.socket?.emit(socketEvent.GAME_PLAYER_1, message, (ack: GameDataDto): void => {
					resolve(ack);
				});
			});
		} else if (p == 'p2') {
			return new Promise<GameDataDto>((resolve): void => {
				this.socket?.emit(socketEvent.GAME_PLAYER_2, message, (ack: GameDataDto): void => {
					resolve(ack);
				});
			});
		}
	}

	public joinPlayerRoom(matchId: string): Promise<string> {
		return new Promise<string>((resolve): void => {
			this.socket?.emit(socketEvent.GAME_JOIN_ON_ROOM, matchId, (ack: string): void => {
				resolve(ack);
			});
		});
	}

	public emitReady(message: ConsultDataDto): Promise<ConsultDataDto> {
		return new Promise<ConsultDataDto>((resolve): void => {
			this.socket?.emit(socketEvent.GAME_PLAYER_IS_READY, message, (ack: ConsultDataDto): void => {
				resolve(ack);
			});
		});
	}

	public emitAbandoned(message: ConsultDataDto): Promise<ConsultDataDto> {
		return new Promise<ConsultDataDto>((resolve): void => {
			this.socket?.emit(socketEvent.GAME_ABANDONED, message, (ack: ConsultDataDto): void => {
				resolve(ack);
			});
		});
	}
}

export const gameService: GameService = new GameService();
