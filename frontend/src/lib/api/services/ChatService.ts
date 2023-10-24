import { io, Socket } from 'socket.io-client';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
	PrivateMessageHistoryDto,
	PrivateMessageDto,
	GroupMessageDto,
	GroupChatDto,
	GroupChatDeletedResponseDto,
	ChatPasswordDto,
	PasswordUpdateResponseDto,
	GroupMemberDto,
	MemberRoleUpdatedResponseDto,
	GroupMemberDeletedResponse,
	GroupCreationDto,
	GroupChatHistoryDto
} from '$lib/dtos';
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
			this.socket?.emit(
				socketEvent.SEND_PRIVATE_MESSAGE,
				message,
				(ack: PrivateMessageDto): void => {
					resolve(ack);
				}
			);
		});
	}

	public emitGroupMessage(message: GroupMessageDto): Promise<GroupMessageDto> {
		return new Promise<GroupMessageDto>((resolve): void => {
			this.socket?.emit('sendGroupMessage', message, (ack: GroupMessageDto): void => {
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

	// TODO:
	public getGroupMessageHistory(): Promise<AxiosResponse<GroupChatHistoryDto[]>> {
		return this.axiosInstance.get('/group/messages/history');
	}

	public getAllGroupChats(): Promise<AxiosResponse<GroupChatDto[]>> {
		return this.axiosInstance.get('/group/chats');
	}

	public createGroupChat(group: GroupCreationDto): Promise<AxiosResponse<GroupChatDto>> {
		return this.axiosInstance.post('/group/create', group);
	}

	// TODO:
	public deleteGroupChat(chatId: number): Promise<AxiosResponse<GroupChatDeletedResponseDto>> {
		return this.axiosInstance.delete(`/group/${chatId}`);
	}

	// TODO:
	public joinGroupChat(chatId: number, password?: ChatPasswordDto): Promise<AxiosResponse<void>> {
		if (password) {
			return this.axiosInstance.post(`/group/${chatId}/join`, { password });
		}
		return this.axiosInstance.post(`/group/${chatId}/join`);
	}

	// TODO:
	public leaveGroupChat(chatId: number): Promise<AxiosResponse<void>> {
		return this.axiosInstance.delete(`/group/${chatId}/leave`);
	}

	// TODO:
	public updateGroupChatPassword(
		chatId: number,
		password: string
	): Promise<AxiosResponse<PasswordUpdateResponseDto>> {
		return this.axiosInstance.put(`/group/${chatId}/password`, { password });
	}

	// TODO:
	public deleteGroupChatPassword(
		chatId: number
	): Promise<AxiosResponse<PasswordUpdateResponseDto>> {
		return this.axiosInstance.delete(`/group/${chatId}/password`);
	}

	// TODO:
	public addGroupChatAdmin(
		chatId: number,
		profileId: number
	): Promise<AxiosResponse<GroupMemberDto>> {
		return this.axiosInstance.post(`/group/${chatId}/admin/${profileId}`);
	}

	// TODO:
	public addGroupChatUser(
		chatId: number,
		profileId: number
	): Promise<AxiosResponse<GroupMemberDto>> {
		return this.axiosInstance.post(`/group/${chatId}/user/${profileId}`);
	}

	// TODO:
	public updateGroupChatMemberRole(
		chatId: number,
		profileId: number,
		role: string
	): Promise<AxiosResponse<MemberRoleUpdatedResponseDto>> {
		return this.axiosInstance.put(`/group/${chatId}/member/${profileId}/role`, { role });
	}

	// TODO:
	public kickGroupChatMember(
		chatId: number,
		profileId: number
	): Promise<AxiosResponse<GroupMemberDeletedResponse>> {
		return this.axiosInstance.delete(`/group/${chatId}/member/${profileId}`);
	}
}

const chatService: ChatService = new ChatService('http://localhost:3000');

export default chatService;
