import { io, Socket } from 'socket.io-client';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { PrivateMessageHistoryDto,PrivateMessageDto } from '$lib/dtos'
import { socketEvent } from './SocketsEvents';

class ChatService {
	private readonly socket: Socket;
	private axiosInstance: AxiosInstance;

	constructor(baseURL: string) {
		const socketBaseUrl: string = `${baseURL}/chat`;
		const httpBaseUrl: string = `${baseURL}/api/chat`;

		this.socket = io(socketBaseUrl, { withCredentials: true, autoConnect: false });

		this.axiosInstance = axios.create({
			baseURL: httpBaseUrl,
			withCredentials: true
		});
	}

	public connect(): void {
		this.socket.connect();
	}

	public getSocket(): Socket {
		return this.socket;
	}

	public emitMessage(message: string): void {
		this.socket?.emit('message', message);
	}

	public emitPrivateMessage(message: PrivateMessageDto): Promise<PrivateMessageDto> {
		return new Promise<PrivateMessageDto>((resolve): void => {
			this.socket?.emit(socketEvent.SEND_PRIVATE_MESSAGE, message, (ack: PrivateMessageDto): void => {
				resolve(ack);
			});
		});
	}

	public disconnect(): void {
		this.socket?.disconnect();
	}

	public getPrivateMessageHistory(): Promise<AxiosResponse<PrivateMessageHistoryDto[]>> {
		return this.axiosInstance.get('/private/messages/history');
	}
}

const chatService: ChatService = new ChatService('http://localhost:3000');

export default chatService;
