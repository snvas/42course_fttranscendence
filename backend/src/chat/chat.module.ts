import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [],
  exports: [],
})
export class ChatModule {}
