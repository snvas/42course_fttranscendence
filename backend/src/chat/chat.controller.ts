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
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatRole } from './types/chat-role.type';
import { ChatAdminGuard } from './guards/chat-admin-guard';
import { ChatManagementGuard } from './guards/chat-management.guard';

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
    @Param('chatId', ParseIntPipe) chatId: number,
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatDeletedResponseDto> {
    return await this.chatService.deleteGroupChatById(chatId, user.id);
  }

  // @UseGuards(ChatOwnerGuard)
  // @Put('group/:chatId/password')
  // async updateGroupChatPassword(
  //   @Req() { user }: { user: FortyTwoUserDto },
  //   @Body() password: { password: string },
  // ): Promise<GroupChatDto> {
  //   return await this.chatService.changeGroupChatPassword(password, user.id);
  // }
  //
  // @UseGuards(ChatOwnerGuard)
  // @Put('group/:chatId/password')
  // async deleteGroupChatPassword(
  //   @Req() { user }: { user: FortyTwoUserDto },
  // ): Promise<GroupChatDto> {
  //   return await this.chatService.deleteGroupChatPassword(user.id);
  // }

  @UseGuards(ChatOwnerGuard)
  @Post('group/:chatId/admin/:profileId')
  async addGroupChatAdmin(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.chatService.addGroupChatMember(chatId, profileId, {
      role: 'admin',
    } as ChatRole);
  }

  @UseGuards(ChatAdminGuard)
  @Post('group/:chatId/user/:profileId')
  async addGroupChatUser(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.chatService.addGroupChatMember(chatId, profileId, {
      role: 'user',
    } as ChatRole);
  }

  @UseGuards(ChatManagementGuard)
  @Delete('group/:chatId/member/:profileId')
  async kickGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDeletedResponse> {
    return await this.chatService.kickMemberFromGroupChat(chatId, profileId);
  }

  // @UseGuards(ChatManagementGuard)
  // @Post('group/:chatId/mute/:profileId')
  // async muteGroupChatMember(
  //   @Param('chatId', ParseIntPipe) chatId: number,
  //   @Param('profileId', ParseIntPipe) profileId: number,
  // ): Promise<GroupMemberDto> {
  //   return await this.chatService.muteGroupChatMember(chatId, profileId);
  // }
  //
  // @UseGuards(ChatManagementGuard)
  // @Post('group/:chatId/unmute/:profileId')
  // async unmuteGroupChatMember(
  //   @Param('chatId', ParseIntPipe) chatId: number,
  //   @Param('profileId', ParseIntPipe) profileId: number,
  // ): Promise<GroupMemberDto> {
  //   return await this.chatService.unmuteGroupChatMember(chatId, profileId);
  // }
  //
  // @UseGuards(ChatManagementGuard)
  // @Post('group/:chatId/ban/:profileId')
  // async banGroupChatMember(
  //   @Param('chatId', ParseIntPipe) chatId: number,
  //   @Param('profileId', ParseIntPipe) profileId: number,
  // ): Promise<GroupMemberDto> {
  //   return await this.chatService.banGroupChatMember(chatId, profileId);
  // }
  //
  // @UseGuards(ChatManagementGuard)
  // @Post('group/:chatId/unban/:profileId')
  // async unbanGroupChatMember(
  //     @Param('chatId', ParseIntPipe) chatId: number,
  //     @Param('profileId', ParseIntPipe) profileId: number,
  // ): Promise<GroupMemberDto> {
  //   return await this.chatService.unbanGroupChatMember(chatId, profileId);
  // }

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
