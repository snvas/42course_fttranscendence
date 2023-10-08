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
import { ChatMessageDto } from './dto/chat-message.dto';
import { GroupRoleDto } from './dto/group-role.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('group/chats')
  async getUserGroupChats(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatEntity[]> {
    return this.chatService.getUserGroupChats(user.id);
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
    @Body() roleDto: GroupRoleDto,
  ): Promise<GroupMemberEntity> {
    return await this.chatService.addMemberToGroupChat(
      chatId,
      profileId,
      roleDto,
    );
  }

  @Get('private/messages/profiles')
  async getUserPrivateMessagesProfiles(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<ProfileEntity[]> {
    return await this.chatService.getUserPrivateMessagesProfiles(user.id);
  }

  @Get('private/messages/:profileId')
  async getUserPrivateMessages(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId') profileId: number,
  ): Promise<PrivateMessageEntity[]> {
    return await this.chatService.getUserPrivateMessages(user.id, profileId);
  }

  //Debug Routes
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId') chatId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<GroupMessageEntity> {
    return await this.chatService.saveGroupMessage(chatId, user.id, messageDto);
  }

  @Post('private/:profileId/message')
  async savePrivateMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId') profileId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<PrivateMessageEntity> {
    return await this.chatService.savePrivateMessage(
      user.id,
      profileId,
      messageDto,
    );
  }
}
