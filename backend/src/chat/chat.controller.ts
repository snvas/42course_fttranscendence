import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
  ProfileEntity,
} from '../db/entities';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { GroupCreationDto } from './dto/group-creation.dto';

//TODO:
//Fazer métodos handleGroupMessage and handlePrivate message salvar no db e emitir eventos para os grupos corretos, usuários corretos

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('group/chats')
  async getAllGroupChats(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatEntity[]> {
    return this.chatService.getAllGroupChats(user.id);
  }

  @Get('group/messages/:chatId')
  async getGroupMessages(
    @Param('chatId') chatId: number,
  ): Promise<GroupMessageEntity[]> {
    return await this.chatService.getGroupMessages(chatId);
  }

  @Post('group/create')
  async createGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<GroupChatEntity> {
    return await this.chatService.createGroupChat(groupCreationDto, user.id);
  }

  //Todo: Validar se o usuário que chamou tem role admin
  //@UseGuards(ChatAdminGuard)
  @Post('group/:chatId/member/:profileId')
  async addMemberToGroupChat(
    @Param('chatId') chatId: number,
    @Param('profileId') profileId: number,
  ): Promise<GroupMemberEntity> {
    return await this.chatService.addMemberToGroupChat(chatId, profileId);
  }

  @Get('private/messages/profiles')
  async getPrivateMessagesProfiles(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<ProfileEntity[]> {
    return await this.chatService.getPrivateMessagesProfiles(user.id);
  }

  @Get('private/messages/:profileId')
  async getPrivateMessages(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId') profileId: number,
  ): Promise<PrivateMessageEntity[]> {
    return await this.chatService.getPrivateMessages(user.id, profileId);
  }

  //Debug Routes
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId') chatId: number,
    @Body() message: string,
  ): Promise<GroupMessageEntity> {
    return await this.chatService.saveGroupMessage(chatId, user.id, message);
  }

  @Post('private/:profileId/message')
  async savePrivateMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId') profileId: number,
    @Body() message: { content: string },
  ): Promise<PrivateMessageEntity> {
    return await this.chatService.savePrivateMessage(
      user.id,
      profileId,
      message,
    );
  }
}
