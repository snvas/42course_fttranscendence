import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Oauth2UserDto } from '../user/models/oauth2-user.dto';
import { GroupCreationDto } from './models/group/group-creation.dto';
import { MessageHttpDto } from './models/message/message-http.dto';
import { PrivateMessageDto } from './models/private/private-message.dto';
import { PrivateMessageHistoryDto } from './models/private/private-message-history.dto';
import { GroupMessageDto } from './models/group/group-message.dto';
import { GroupChatDeletedResponseDto } from './models/group/group-chat-deleted-response.dto';
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatRole } from './types/chat-role.type';
import { ChatAdminGuard } from './guards/chat-admin-guard';
import { ChatManagementGuard } from './guards/chat-management.guard';
import { GroupChatUpdatedResponseDto } from './models/group/group-chat-updated-response.dto';
import { GroupChatPasswordDto } from './models/group/group-chat-password.dto';
import { GroupChatHistoryDto } from './models/group/group-chat-history.dto';
import { GroupChatDto } from './models/group/group-chat.dto';
import { GroupMemberDto } from './models/group/group-member.dto';
import { GroupMemberRoleUpdateDto } from './models/group/group-member-role-update.dto';
import { GroupMemberUpdatedResponseDto } from './models/group/group-member-updated-response.dto';
import { GroupMemberDeletedResponseDto } from './models/group/group-member-deleted-response.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(public readonly chatService: ChatService) {}

  @HttpCode(HttpStatus.OK)
  @Get('private/messages/history')
  async getUserPrivateMessagesHistory(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<PrivateMessageHistoryDto[]> {
    return await this.chatService.getPrivateMessageHistory(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('group/messages/history')
  async getUserGroupChatsHistory(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<GroupChatHistoryDto[]> {
    return await this.chatService.getGroupMessageHistory(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('group/chats')
  async getAllGroupChats(): Promise<GroupChatDto[]> {
    return await this.chatService.getAllGroupChats();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('group/create')
  async createGroupChat(
    @Req() { user }: { user: Oauth2UserDto },
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<GroupChatDto> {
    return await this.chatService.createGroupChat(groupCreationDto, user.id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId')
  async deleteGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<GroupChatDeletedResponseDto> {
    return await this.chatService.deleteGroupChat(chatId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/join')
  async joinGroupChat(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: Partial<GroupChatPasswordDto>,
  ): Promise<GroupMemberDto> {
    return await this.chatService.joinGroupChat(chatId, user.id, password);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('group/:chatId/leave')
  async leaveGroupChat(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<void> {
    await this.chatService.leaveGroupChat(chatId, user.id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Put('group/:chatId/password')
  async updateGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: GroupChatPasswordDto,
  ): Promise<GroupChatUpdatedResponseDto> {
    return await this.chatService.updateGroupChatPassword(chatId, password);
  }

  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId/password')
  async deleteGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<GroupChatUpdatedResponseDto> {
    return await this.chatService.deleteGroupChatPassword(chatId);
  }

  @HttpCode(HttpStatus.CREATED)
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

  @HttpCode(HttpStatus.CREATED)
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

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatManagementGuard)
  @Delete('group/:chatId/member/:profileId')
  async kickGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDeletedResponseDto> {
    return this.chatService.kickGroupChatMember(chatId, profileId);
  }

  @UseGuards(ChatOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @Put('group/:chatId/member/:profileId/role')
  async updateGroupChatMemberRole(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() role: GroupMemberRoleUpdateDto,
  ): Promise<GroupMemberUpdatedResponseDto> {
    return await this.chatService.updateGroupChatMemberRole(
      chatId,
      profileId,
      role,
    );
  }

  @UseGuards(ChatManagementGuard)
  @Put('group/:chatId/mute/:profileId')
  async muteGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto> {
    return await this.chatService.muteGroupChatMember(chatId, profileId);
  }

  @UseGuards(ChatManagementGuard)
  @Put('group/:chatId/unmute/:profileId')
  async unmuteGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto> {
    return await this.chatService.unmuteGroupChatMember(chatId, profileId);
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/ban/:profileId')
  async banGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.chatService.banGroupChatMember(chatId, profileId);
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/unban/:profileId')
  async unbanGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.chatService.unbanGroupChatMember(chatId, profileId);
  }

  //debug routes
  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() messageDto: MessageHttpDto,
  ): Promise<GroupMessageDto> {
    return await this.chatService.saveHttpGroupMessage(
      user.id,
      chatId,
      messageDto,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('private/:profileId/message')
  async savePrivateMessage(
    @Req() { user }: { user: Oauth2UserDto },
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() messageDto: MessageHttpDto,
  ): Promise<PrivateMessageDto> {
    return await this.chatService.saveHttpPrivateMessage(
      user.id,
      profileId,
      messageDto,
    );
  }
}
