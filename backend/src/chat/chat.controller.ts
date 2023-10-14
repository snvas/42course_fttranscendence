import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { GroupCreationDto } from './dto/group-creation.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GroupRoleDto } from './dto/group-role.dto';
import { PrivateMessageDto } from './dto/private-message.dto';
import { PrivateMessageHistoryDto } from './dto/private-message-history.dto';
import { GroupChatHistoryDto } from './dto/group-chat-history.dto';
import { GroupChatDto } from './dto/group-chat.dto';
import { GroupMemberDto } from './dto/group-member.dto';
import { GroupMessageDto } from './dto/group-message.dto';

//TODO:
//Delete group chat
//Remove member from group chat
//Change member role in group chat

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('private/messages/history')
  async getUserPrivateMessagesHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<PrivateMessageHistoryDto[]> {
    return await this.chatService.getUserPrivateMessagesHistory(user.id);
  }

  @Get('group/chats/history')
  async getUserGroupChatsHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatHistoryDto[]> {
    return await this.chatService.getUserGroupChatsHistory(user.id);
  }

  @Post('group/create')
  async createGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<GroupChatDto> {
    return await this.chatService.createGroupChat(groupCreationDto, user.id);
  }

  @Post('group/:chatId/member/:profileId')
  async addMemberToGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId') chatId: number,
    @Param('profileId') profileId: number,
    @Body() roleDto: GroupRoleDto,
  ): Promise<GroupMemberDto> {
    return await this.chatService.addMemberToGroupChat(
      user.id,
      chatId,
      profileId,
      roleDto,
    );
  }

  //Debug routes
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId') chatId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<GroupMessageDto> {
    return await this.chatService.saveGroupMessage(chatId, user.id, messageDto);
  }

  @Post('private/:profileId/message')
  async savePrivateMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId') profileId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<PrivateMessageDto> {
    return await this.chatService.savePrivateMessage(
      user.id,
      profileId,
      messageDto,
    );
  }
}