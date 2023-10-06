import { Injectable, Logger } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket';
import { ChatMessageDto } from './dto/chat-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from '../db/entities';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);
  private onlineUsers: Map<number, AuthenticatedSocket> = new Map();

  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatMessageRepository: Repository<ChatMessageEntity>,
  ) {}

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
      `### Online users: ${onlineUsersArray.map(
        (user: AuthenticatedSocket) => user.request.user.username + ',',
      )}`,
    );

    return onlineUsersArray.map(
      (user: AuthenticatedSocket) => user.request.user.username,
    );
  }

  async saveMessage(
    socket: AuthenticatedSocket,
    message: string,
  ): Promise<ChatMessageDto> {
    const messageEntity: ChatMessageEntity = this.chatMessageRepository.create({
      name: socket.request.user.username,
      message,
    });

    const chatDb: ChatMessageEntity = await this.chatMessageRepository.save(
      messageEntity,
    );

    this.logger.verbose(`### Event message: ${JSON.stringify(chatDb)}`);

    return plainToClass(ChatMessageDto, chatDb);
  }
}
