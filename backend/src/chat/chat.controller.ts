import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { GroupCreationDto } from './models/group-creation.dto';
import { ChatMessageDto } from './models/chat-message.dto';
import { PrivateMessageDto } from './models/private-message.dto';
import { PrivateMessageHistoryDto } from './models/private-message-history.dto';
import { GroupChatHistoryDto } from './models/group-chat-history.dto';
import { GroupChatDto } from './models/group-chat.dto';
import { GroupMemberDto } from './models/group-member.dto';
import { GroupMessageDto } from './models/group-message.dto';
import { GroupChatDeletedResponseDto } from './models/group-chat-deleted-response.dto';
import { GroupMemberDeletedResponse } from './interfaces/group-member-deleted-response.interface';
import { ChatManagementGuard } from './guards/chat-management.guard';
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatRole } from './types/chat-role.type';

//TODO:
//Remove member from group chat - check if is admin
//  Check if the removed member is admin, if so, only the owner can remove
//  Check if the remover member is the owner, if so, he can't be removed

//Change member role in group chat - check if is admin

//Remove non necessary infos from member in GroupChatDto and GroupChatHistoryDto

//Create joinPublicGroup and joinPrivateGroup to be member of group

//Receive a group name in websocket, check if use is member of the group, if so, join socket room

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

  @Get('group/chats')
  async getAllGroupChats(): Promise<GroupChatDto[]> {
    return await this.chatService.getAllGroupChats();
  }

  @Post('group/create')
  async createGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<GroupChatDto> {
    return await this.chatService.createGroupChat(groupCreationDto, user.id);
  }

  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId')
  async deleteGroupChat(
    @Param('chatId') chatId: number,
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatDeletedResponseDto> {
    return await this.chatService.deleteGroupChatById(chatId, user.id);
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/admin/:profileId')
  async addAdminToGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.chatService.addMemberToGroupChat(chatId, profileId, {
      role: 'admin',
    } as ChatRole);
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/member/:profileId')
  async addMemberToGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.chatService.addMemberToGroupChat(chatId, profileId, {
      role: 'user',
    } as ChatRole);
  }

  @UseGuards(ChatManagementGuard)
  @Delete('group/:chatId/member/:profileId')
  async removeMemberToGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDeletedResponse> {
    return await this.chatService.removeMemberFromGroupChat(
      user.id,
      chatId,
      profileId,
    );
  }

  //Debug routes
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<GroupMessageDto> {
    return await this.chatService.saveGroupMessage(chatId, user.id, messageDto);
  }

  @Post('private/:profileId/message')
  async savePrivateMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<PrivateMessageDto> {
    return await this.chatService.savePrivateMessage(
      user.id,
      profileId,
      messageDto,
    );
  }
}
