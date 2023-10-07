import {io, Socket} from "socket.io-client";

class ChatService {
    private readonly socket: Socket;

    constructor(baseURL: string) {
        this.socket = io(`${baseURL}/chat`, {withCredentials: true, autoConnect: false});
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

    public disconnect(): void {
        this.socket?.disconnect();
    }
}

const chatService: ChatService = new ChatService(
    "http://localhost:3000"
);

export default chatService;
