import {io, Socket} from "socket.io-client";
import axios, {AxiosInstance, AxiosResponse} from "axios";
import {PrivateMessageHistoryDto} from "../../../backend/src/chat/models/private-message-history.dto.ts";
import {PrivateMessageDto} from "../../../backend/src/chat/models/private-message.dto.ts";
import {GroupMessageDto} from "../../../backend/src/chat/models/group-message.dto.ts";
import {GroupChatDto} from "../../../backend/src/chat/models/group-chat.dto.ts";
import {GroupChatDeletedResponseDto} from "../../../backend/src/chat/models/group-chat-deleted-response.dto.ts";
import {PasswordUpdateResponseDto} from "../../../backend/src/chat/models/password-update-response.dto.ts";
import {GroupMemberDto} from "../../../backend/src/chat/models/group-member.dto.ts";
import {
    GroupMemberDeletedResponse
} from "../../../backend/src/chat/interfaces/group-member-deleted-response.interface.ts";
import {ChatPasswordDto} from "../../../backend/src/chat/models/chat-password.dto.ts";
import {MemberRoleUpdatedResponseDto} from "../../../backend/src/chat/models/member-role-updated-response.dto.ts";
import {GroupCreationDto} from "../../../backend/src/chat/models/group-creation.dto.ts";

class ChatService {
    private readonly socket: Socket;
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        const socketBaseUrl: string = `${baseURL}/chat`;
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

    public emitMessage(message: string): void {
        this.socket?.emit("message", message);
    }

    public emitPrivateMessage(message: PrivateMessageDto): Promise<PrivateMessageDto> {
        return new Promise<PrivateMessageDto>((resolve): void => {
            this.socket?.emit("sendPrivateMessage", message, (ack: PrivateMessageDto): void => {
                resolve(ack);
            });
        });
    }

    public emitGroupMessage(message: GroupMessageDto): Promise<GroupMessageDto> {
        return new Promise<GroupMessageDto>((resolve): void => {
            this.socket?.emit("sendGroupMessage", message, (ack: GroupMessageDto): void => {
                resolve(ack);
            });
        });
    }

    public disconnect(): void {
        this.socket?.disconnect();
    }

    public getPrivateMessageHistory(): Promise<AxiosResponse<PrivateMessageHistoryDto[]>> {
        return this.axiosInstance.get("/private/messages/history");
    }

    public getGroupMessageHistory(): Promise<AxiosResponse<GroupMessageDto[]>> {
        return this.axiosInstance.get("/group/messages/history");
    }

    public getAllGroupChats(): Promise<AxiosResponse<GroupChatDto[]>> {
        return this.axiosInstance.get("/group/chats");
    }

    public createGroupChat(groupCreationDto: GroupCreationDto): Promise<AxiosResponse<GroupChatDto>> {
        return this.axiosInstance.post("/group/create", groupCreationDto);
    }

    public deleteGroupChat(chatId: number): Promise<AxiosResponse<GroupChatDeletedResponseDto>> {
        return this.axiosInstance.delete(`/group/${chatId}`);
    }

    public joinGroupChat(chatId: number, password?: ChatPasswordDto): Promise<AxiosResponse<void>> {
        if (password) {
            return this.axiosInstance.post(`/group/${chatId}/join`, {password});
        }
        return this.axiosInstance.post(`/group/${chatId}/join`);
    }

    public leaveGroupChat(chatId: number): Promise<AxiosResponse<void>> {
        return this.axiosInstance.delete(`/group/${chatId}/leave`);
    }

    public updateGroupChatPassword(chatId: number, password: string): Promise<AxiosResponse<PasswordUpdateResponseDto>> {
        return this.axiosInstance.put(`/group/${chatId}/password`, {password});
    }

    public deleteGroupChatPassword(chatId: number): Promise<AxiosResponse<PasswordUpdateResponseDto>> {
        return this.axiosInstance.delete(`/group/${chatId}/password`);
    }

    public addGroupChatAdmin(chatId: number, profileId: number): Promise<AxiosResponse<GroupMemberDto>> {
        return this.axiosInstance.post(`/group/${chatId}/admin/${profileId}`);
    }

    public addGroupChatUser(chatId: number, profileId: number): Promise<AxiosResponse<GroupMemberDto>> {
        return this.axiosInstance.post(`/group/${chatId}/user/${profileId}`);
    }

    public updateGroupChatMemberRole(chatId: number, profileId: number, role: string): Promise<AxiosResponse<MemberRoleUpdatedResponseDto>> {
        return this.axiosInstance.put(`/group/${chatId}/member/${profileId}/role`, {role});
    }

    public kickGroupChatMember(chatId: number, profileId: number): Promise<AxiosResponse<GroupMemberDeletedResponse>> {
        return this.axiosInstance.delete(`/group/${chatId}/member/${profileId}`);
    }
}

const chatService: ChatService = new ChatService(
    "http://localhost:3000"
);

export default chatService;
