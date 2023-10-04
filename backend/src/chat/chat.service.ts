import { Injectable, Logger } from '@nestjs/common';
import { ChatMessage } from './entities/chat-message.entity';
import { AuthenticatedSocket } from './types/authenticated-socket';

@Injectable()
export class ChatService {
  private chats: ChatMessage[] = [
    {
      name: 'Marius',
      message: 'heyooo',
      timestamp: new Date().toLocaleString(),
    },
  ];
  private readonly logger: Logger = new Logger(ChatService.name);
  private onlineUsers: Map<number, AuthenticatedSocket> = new Map();

  setOnlineUser(socket: AuthenticatedSocket) {
    this.onlineUsers.set(socket.request.user.id, socket);
  }

  removeOnlineUser(socket: AuthenticatedSocket) {
    this.onlineUsers.delete(socket.request.user.id);
  }

  getOnlineUsers(): string[] {
    const onlineUsersArray: AuthenticatedSocket[] = Array.from(
      this.onlineUsers.values(),
    );

    this.logger.verbose(
      `Online users: ${onlineUsersArray.map(
        (user: AuthenticatedSocket) => user.request.user.username + ',',
      )}`,
    );

    return onlineUsersArray.map(
      (user: AuthenticatedSocket) => user.request.user.username,
    );
  }

  saveMessage(chat: ChatMessage): void {
    this.chats.push(chat);
  }

  findAll(): ChatMessage[] {
    return this.chats;
  }
}
