import { Controller, Get } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Get('getAllGroupMessages')
  getAllGroupMessages() {
    return 'getAllGroupMessages';
  }

  @Get('getAllPrivateMessages')
  getAllPrivateMessages() {
    return 'getAllGroupMessages';
  }
}
