import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

//https://stackoverflow.com/questions/68684439/passport-session-authentication-with-websockets-and-nest-js-not-authenticating
@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
