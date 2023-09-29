import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  chats: Chat[] = [{ name: 'Marius', message: 'heyooo' }];
  socketToUser: { [socketId: string]: string } = {};

  identify(name: string, socketId: string) {
    this.socketToUser[socketId] = name;
    return Object.values(this.socketToUser); //online people in the chat
  }

  getClientName(socketId: string) {
    return this.socketToUser[socketId];
  }

  create(createChatDto: CreateChatDto, clientId: string) {
    const chat = {
      name: this.socketToUser[clientId],
      message: createChatDto.message,
    };
    this.chats.push(chat);
    return chat;
  }

  findAll() {
    return this.chats;
  }
}
