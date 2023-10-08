import { Controller, Get, Param, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  GroupChatEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
  ProfileEntity,
} from '../db/entities';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';

//TODO:
//Fazer métodos handleGroupMessage and handlePrivate message salvar no db e emitir eventos para os grupos corretos, usuários corretos

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('group-messages/chats')
  async getAllGroupMemberships(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatEntity[]> {
    return this.chatService.getAllGroupChats(user.id);
  }

  @Get('group-messages/:chatId')
  async getGroupMessages(
    @Param('chatId') chatId: number,
  ): Promise<GroupMessageEntity[]> {
    return await this.chatService.getGroupMessages(chatId);
  }

  @Get('private-messages/profiles')
  async getPrivateMessagesProfiles(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<ProfileEntity[]> {
    return await this.chatService.getPrivateMessagesProfiles(user.id);
  }

  @Get('private-messages/:profileId')
  async getPrivateMessages(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId') profileId: number,
  ): Promise<PrivateMessageEntity[]> {
    return await this.chatService.getPrivateMessages(user.id, profileId);
  }
}
