import {io, Socket} from "socket.io-client";
import axios, {AxiosInstance, AxiosResponse} from "axios";
import {PrivateMessageHistoryDto} from "../../../backend/src/chat/dto/private-message-history.dto.ts";
import {PrivateMessageDto} from "../../../backend/src/chat/dto/private-message.dto.ts";

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

    public disconnect(): void {
        this.socket?.disconnect();
    }

    public getPrivateMessageHistory(): Promise<AxiosResponse<PrivateMessageHistoryDto[]>> {
        return this.axiosInstance.get("/private/messages/history");
    }
}

const chatService: ChatService = new ChatService(
    "http://localhost:3000"
);

export default chatService;
