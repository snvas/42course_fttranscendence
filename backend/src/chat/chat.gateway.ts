import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as cookie from 'cookie';

@WebSocketGateway(3001, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);

    // Access cookies from the socket's request object
    const cookies = socket.request.headers.cookie;
    // Parse the cookies using the 'cookie' library

    if (cookies) {
      const parsedCookies = cookie.parse(cookies);

      const pongSession = parsedCookies['pongSessionId'];

      this.logger.verbose(`### Pong Session: ${pongSession}`);

      // if (parsedCookie && parsedCookie.expires > Date.now()) {
      //   console.log('Session is valid.');
      // } else {
      //   console.log('Session is expired or invalid.');
      // }
    }

    this.logger.verbose(JSON.stringify(socket.handshake));
    // You can also emit data to the client
    socket.emit('connectionSuccess', 'Connected successfully!');
  }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    this.logger.log(
      `### Received test message: ${data} from socket: ${socket.id}`,
    );
    this.server.emit('test', data);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const name = this.chatService.getClientName(socket.id);
    const chat = {
      name,
      message,
    };
    this.server.emit('chat', chat);
    return chat;
  }

  @SubscribeMessage('createChat')
  async create(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = this.chatService.create(createChatDto, socket.id);

    this.server.emit('chat', chat);
    return chat;
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.chatService.identify(name, socket.id);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() socket: Socket,
  ) {
    const name = this.chatService.getClientName(socket.id);

    //send to everyone expect the sender
    socket.broadcast.emit('typing', { name, isTyping });
  }
}
