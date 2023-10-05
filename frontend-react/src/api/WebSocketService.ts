import { io, Socket } from "socket.io-client";

class WebSocketService {
  private readonly socket: Socket;

  constructor(baseURL: string) {
    this.socket = io(baseURL, { withCredentials: true, autoConnect: false });
  }

  connect(): void {
    this.socket.connect();
  }

  getSocket(): Socket {
    return this.socket;
  }

  emitMessage(message: string): void {
    this.socket?.emit("message", message);
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}

const webSocketService: WebSocketService = new WebSocketService(
  "http://localhost:3000"
);

export default webSocketService;
