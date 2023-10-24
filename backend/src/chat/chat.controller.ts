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
import { ChatService } from './chat.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { GroupCreationDto } from './models/group-creation.dto';
import { ChatMessageDto } from './models/chat-message.dto';
import { PrivateMessageDto } from './models/private-message.dto';
import { PrivateMessageHistoryDto } from './models/private-message-history.dto';
import { GroupMessageDto } from './models/group-message.dto';
import { GroupChatDeletedResponseDto } from './models/group-chat-deleted-response.dto';
import { GroupMemberDeletedResponse } from './interfaces/group-member-deleted-response.interface';
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatRole } from './types/chat-role.type';
import { ChatAdminGuard } from './guards/chat-admin-guard';
import { ChatManagementGuard } from './guards/chat-management.guard';
import { PasswordUpdateResponseDto } from './models/password-update-response.dto';
import { ChatPasswordDto } from './models/chat-password.dto';
import { ChatGateway } from './chat.gateway';
import { GroupChatHistoryDto } from './models/group-chat-history.dto';
import { GroupChatDto } from './models/group-chat.dto';
import { GroupMemberDto } from './models/group-member.dto';
import { socketEvent } from '../utils/socket-events';
import { UpdateMemberRoleDto } from './models/update-member-role.dto';
import { MemberUpdatedResponseDto } from './models/member-updated-response.dto';
import { Server } from 'socket.io';
import { GroupChatEventDto } from './models/group-chat-event.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageGateway: ChatGateway,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('private/messages/history')
  async getUserPrivateMessagesHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<PrivateMessageHistoryDto[]> {
    return await this.chatService.getUserPrivateMessagesHistory(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('group/messages/history')
  async getUserGroupChatsHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatHistoryDto[]> {
    return await this.chatService.getUserGroupChatsHistory(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('group/chats')
  async getAllGroupChats(): Promise<GroupChatDto[]> {
    return await this.chatService.getAllGroupChats();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('group/create')
  async createGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<GroupChatDto> {
    const groupChat: GroupChatDto = await this.chatService.createGroupChat(
      groupCreationDto,
      user.id,
    );

    (await this.messageGateway.getServer()).emit(
      socketEvent.GROUP_CHAT_CREATED,
      groupChat,
    );

    return groupChat;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId')
  async deleteGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<GroupChatDeletedResponseDto> {
    const deletedResponse: GroupChatDeletedResponseDto =
      await this.chatService.deleteGroupChatById(chatId);

    const server: Server = await this.messageGateway.getServer();

    server.emit(socketEvent.GROUP_CHAT_DELETED, {
      chatId,
    } as GroupChatEventDto);

    server.in(`${chatId}`).disconnectSockets();

    return deletedResponse;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/join')
  async joinGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: Partial<ChatPasswordDto>,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberDto = await this.chatService.joinGroupChat(
      chatId,
      user.id,
      password,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.JOINED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('group/:chatId/leave')
  async leaveGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<void> {
    const deletedResponseAndMember: GroupMemberDeletedResponse &
      GroupMemberDto = await this.chatService.leaveGroupChat(chatId, user.id);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.LEAVE_GROUP_CHAT_MEMBER, {
        id: deletedResponseAndMember.id,
        role: deletedResponseAndMember.role,
        isMuted: deletedResponseAndMember.isMuted,
        groupChat: deletedResponseAndMember.groupChat,
        profile: deletedResponseAndMember.profile,
      } as GroupMemberDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Put('group/:chatId/password')
  async updateGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: ChatPasswordDto,
  ): Promise<PasswordUpdateResponseDto> {
    const passwordUpdate: PasswordUpdateResponseDto =
      await this.chatService.changeGroupChatPassword(chatId, password);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_PASSWORD_UPDATED, {
        chatId,
      } as GroupChatEventDto);

    return passwordUpdate;
  }

  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId/password')
  async deleteGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<Partial<PasswordUpdateResponseDto>> {
    const passwordUpdate: Partial<PasswordUpdateResponseDto> =
      await this.chatService.deleteGroupChatPassword(chatId);

    const groupChat: GroupChatDto = await this.chatService.getGroupChatDtoById(
      chatId,
    );
    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_PASSWORD_DELETED, groupChat);

    return passwordUpdate;
  }

  @UseGuards(ChatOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @Put('group/:chatId/member/:profileId/role')
  async updateGroupChatMemberRole(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() role: UpdateMemberRoleDto,
  ): Promise<MemberUpdatedResponseDto> {
    const groupMember: GroupMemberDto & MemberUpdatedResponseDto =
      await this.chatService.updateGroupChatMemberRole(chatId, profileId, role);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_ROLE_UPDATED, {
        id: groupMember.id,
        role: groupMember.role,
        isMuted: groupMember.isMuted,
        profile: groupMember.profile,
      } as GroupMemberDto);

    return {
      updated: groupMember.updated,
      affected: groupMember.affected,
    } as MemberUpdatedResponseDto;
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ChatOwnerGuard)
  @Post('group/:chatId/admin/:profileId')
  async addGroupChatAdmin(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberDto =
      await this.chatService.addGroupChatMember(chatId, profileId, {
        role: 'admin',
      } as ChatRole);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.ADDED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ChatAdminGuard)
  @Post('group/:chatId/user/:profileId')
  async addGroupChatUser(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberDto =
      await this.chatService.addGroupChatMember(chatId, profileId, {
        role: 'user',
      } as ChatRole);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.ADDED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatManagementGuard)
  @Delete('group/:chatId/member/:profileId')
  async kickGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDeletedResponse> {
    const deletedResponseAndMember: GroupMemberDeletedResponse &
      GroupMemberDto = await this.chatService.removeMemberFromGroupChat(
      chatId,
      profileId,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.KICKED_GROUP_CHAT_MEMBER, {
        id: deletedResponseAndMember.id,
        role: deletedResponseAndMember.role,
        isMuted: deletedResponseAndMember.isMuted,
        groupChat: deletedResponseAndMember.groupChat,
        profile: deletedResponseAndMember.profile,
      } as GroupMemberDto);

    return {
      deleted: deletedResponseAndMember.deleted,
      affected: deletedResponseAndMember.affected,
    } as GroupMemberDeletedResponse;
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/mute/:profileId')
  async muteGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<MemberUpdatedResponseDto> {
    const updatedResponseMember: MemberUpdatedResponseDto & GroupMemberDto =
      await this.chatService.muteGroupChatMember(chatId, profileId);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_MUTED, {
        id: updatedResponseMember.id,
        role: updatedResponseMember.role,
        isMuted: updatedResponseMember.isMuted,
        groupChat: updatedResponseMember.groupChat,
        profile: updatedResponseMember.profile,
      } as GroupMemberDto);

    return {
      updated: updatedResponseMember.updated,
      affected: updatedResponseMember.affected,
    } as MemberUpdatedResponseDto;
  }

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

  //TODO: add server.to(chatId).emit() to send message to all group members for test
  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<GroupMessageDto> {
    const groupMessage: GroupMessageDto =
      await this.chatService.saveGroupMessage(chatId, user.id, messageDto);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.RECEIVE_GROUP_MESSAGE, groupMessage);

    return groupMessage;
  }

  @HttpCode(HttpStatus.CREATED)
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
