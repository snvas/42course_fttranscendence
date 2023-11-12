import {io, Socket} from 'socket.io-client';
import axios, {type AxiosInstance, type AxiosResponse} from 'axios';
import type {
	GroupChatDeletedResponseDto,
	GroupChatDto,
	GroupChatHistoryDto,
	GroupChatPasswordDto,
	GroupChatUpdatedResponseDto,
	GroupCreationDto,
	GroupMemberDeletedResponseDto,
	GroupMemberDto,
	GroupMemberUpdatedResponseDto,
	GroupMessageDto,
	PrivateMessageDto,
	PrivateMessageHistoryDto
} from '$lib/dtos';
import {socketEvent} from './SocketsEvents';

class ChatService {
    private readonly socket: Socket;
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        const socketBaseUrl: string = `${baseURL}`;
        const httpBaseUrl: string = `${baseURL}/api/chat`;

        this.socket = io(socketBaseUrl, {withCredentials: true, autoConnect: false});

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

    public disconnect(): void {
        this.socket?.disconnect();
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
            this.socket?.emit(socketEvent.SEND_GROUP_MESSAGE, message, (ack: GroupMessageDto): void => {
                resolve(ack);
            });
        });
    }

    public getPrivateMessageHistory(): Promise<AxiosResponse<PrivateMessageHistoryDto[]>> {
        return this.axiosInstance.get('/private/messages/history');
    }

    public getGroupMessageHistory(): Promise<AxiosResponse<GroupChatHistoryDto[]>> {
        return this.axiosInstance.get('/group/messages/history');
    }

    public getAllGroupChats(): Promise<AxiosResponse<GroupChatDto[]>> {
        return this.axiosInstance.get('/group/chats');
    }

    public createGroupChat(group: GroupCreationDto): Promise<AxiosResponse<GroupChatDto>> {
        return this.axiosInstance.post('/group/create', group);
    }

    public deleteGroupChat(chatId: number): Promise<AxiosResponse<GroupChatDeletedResponseDto>> {
        return this.axiosInstance.delete(`/group/${chatId}`);
    }

    public joinGroupChat(
        chatId: number,
        password?: GroupChatPasswordDto
    ): Promise<AxiosResponse<void>> {
        if (password) {
            return this.axiosInstance.post(`/group/${chatId}/join`, password);
        }
        return this.axiosInstance.post(`/group/${chatId}/join`);
    }

    public leaveGroupChat(chatId: number): Promise<AxiosResponse<void>> {
        return this.axiosInstance.delete(`/group/${chatId}/leave`);
    }

    public updateGroupChatPassword(
        chatId: number,
        password: string
    ): Promise<AxiosResponse<GroupChatUpdatedResponseDto>> {
        return this.axiosInstance.put(`/group/${chatId}/password`, {password});
    }

    public deleteGroupChatPassword(
        chatId: number
    ): Promise<AxiosResponse<GroupChatUpdatedResponseDto>> {
        return this.axiosInstance.delete(`/group/${chatId}/password`);
    }

    public addGroupChatAdmin(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberDto>> {
        return this.axiosInstance.post(`/group/${chatId}/admin/${profileId}`);
    }

    public addGroupChatUser(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberDto>> {
        return this.axiosInstance.post(`/group/${chatId}/user/${profileId}`);
    }

    public updateGroupChatMemberRole(
        chatId: number,
        profileId: number,
        role: string
    ): Promise<AxiosResponse<GroupChatUpdatedResponseDto>> {
        return this.axiosInstance.put(`/group/${chatId}/member/${profileId}/role`, {role});
    }

    public kickGroupChatMember(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberDeletedResponseDto>> {
        return this.axiosInstance.delete(`/group/${chatId}/member/${profileId}`);
    }

    public muteGroupChatMember(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberUpdatedResponseDto>> {
        return this.axiosInstance.put(`/group/${chatId}/mute/${profileId}`);
    }

    public unmuteGroupChatMember(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberUpdatedResponseDto>> {
        return this.axiosInstance.put(`/group/${chatId}/unmute/${profileId}`);
    }

    public banGroupChatMember(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberDto>> {
        return this.axiosInstance.post(`/group/${chatId}/ban/${profileId}`);
    }

    public unbanGroupChatMember(
        chatId: number,
        profileId: number
    ): Promise<AxiosResponse<GroupMemberDto>> {
        return this.axiosInstance.post(`/group/${chatId}/unban/${profileId}`);
    }
}

export const chatService: ChatService = new ChatService('http://localhost:3000');
