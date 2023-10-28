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
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { GroupCreationDto } from './models/group/group-creation.dto';
import { ChatMessageDto } from './models/tmp/chat-message.dto';
import { PrivateMessageDto } from './models/private/private-message.dto';
import { PrivateMessageHistoryDto } from './models/private/private-message-history.dto';
import { GroupMessageDto } from './models/group/group-message.dto';
import { GroupChatDeletedResponseDto } from './models/group/group-chat-deleted-response.dto';
import { GroupMemberDeletedResponse } from './interfaces/group/group-member-deleted-response.interface';
import { ChatOwnerGuard } from './guards/chat-owner-guard';
import { ChatRole } from './types/chat-role.type';
import { ChatAdminGuard } from './guards/chat-admin-guard';
import { ChatManagementGuard } from './guards/chat-management.guard';
import { GroupChatUpdatedResponseDto } from './models/group/group-chat-updated-response.dto';
import { GroupChatPasswordDto } from './models/group/group-chat-password.dto';
import { ChatGateway } from './chat.gateway';
import { GroupChatHistoryDto } from './models/group/group-chat-history.dto';
import { GroupChatDto } from './models/group/group-chat.dto';
import { GroupMemberDto } from './models/group/group-member.dto';
import { socketEvent } from '../utils/socket-events';
import { GroupMemberRoleUpdateDto } from './models/group/group-member-role-update.dto';
import { GroupMemberUpdatedResponseDto } from './models/group/group-member-updated-response.dto';
import { Server } from 'socket.io';
import { GroupChatEventDto } from './models/group/group-chat-event.dto';
import { GroupMemberDeletedResponseDto } from './models/group/group-member-deleted-response.dto';
import { GroupChatService } from './services/group-chat.service';
import { GroupMemberService } from './services/group-member.service';
import { PrivateChatService } from './services/private-chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly privateChatService: PrivateChatService,
    private readonly groupChatService: GroupChatService,
    public readonly groupMemberService: GroupMemberService,
    private readonly messageGateway: ChatGateway,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('private/messages/history')
  async getUserPrivateMessagesHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<PrivateMessageHistoryDto[]> {
    return await this.privateChatService.getUserPrivateMessagesHistory(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('group/messages/history')
  async getUserGroupChatsHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<GroupChatHistoryDto[]> {
    return await this.groupChatService.getUserGroupChatsHistory(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('group/chats')
  async getAllGroupChats(): Promise<GroupChatDto[]> {
    return await this.groupChatService.getAllGroupChats();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('group/create')
  async createGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Body() groupCreationDto: GroupCreationDto,
  ): Promise<GroupChatDto> {
    const groupChat: GroupChatDto = await this.groupChatService.createGroupChat(
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
      await this.groupChatService.deleteGroupChatById(chatId);

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
    @Body() password: Partial<GroupChatPasswordDto>,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberDto =
      await this.groupChatService.joinGroupChat(chatId, user.id, password);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.JOINED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('group/:chatId/leave')
  async leaveGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<void> {
    const deletedResponseAndMember: GroupMemberDeletedResponse &
      GroupMemberDto = await this.groupChatService.leaveGroupChat(
      chatId,
      user.id,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.LEAVE_GROUP_CHAT_MEMBER, {
        id: deletedResponseAndMember.id,
        role: deletedResponseAndMember.role,
        isMuted: deletedResponseAndMember.isMuted,
        isBanned: deletedResponseAndMember.isBanned,
        groupChat: deletedResponseAndMember.groupChat,
        profile: deletedResponseAndMember.profile,
      } as GroupMemberDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Put('group/:chatId/password')
  async updateGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: GroupChatPasswordDto,
  ): Promise<GroupChatUpdatedResponseDto> {
    const passwordUpdate: GroupChatUpdatedResponseDto =
      await this.groupChatService.changeGroupChatPassword(chatId, password);

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
  ): Promise<Partial<GroupChatUpdatedResponseDto>> {
    const passwordUpdate: Partial<GroupChatUpdatedResponseDto> =
      await this.groupChatService.deleteGroupChatPassword(chatId);

    const groupChat: GroupChatDto =
      await this.groupChatService.getGroupChatDtoById(chatId);
    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_PASSWORD_DELETED, groupChat);

    return passwordUpdate;
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ChatOwnerGuard)
  @Post('group/:chatId/admin/:profileId')
  async addGroupChatAdmin(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberDto =
      await this.groupChatService.addMemberToGroupChat(chatId, profileId, {
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
      await this.groupChatService.addMemberToGroupChat(chatId, profileId, {
        role: 'user',
      } as ChatRole);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.ADDED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  @UseGuards(ChatOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @Put('group/:chatId/member/:profileId/role')
  async updateGroupChatMemberRole(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() role: GroupMemberRoleUpdateDto,
  ): Promise<GroupMemberUpdatedResponseDto> {
    const groupMember: GroupMemberDto & GroupMemberUpdatedResponseDto =
      await this.groupMemberService.updateGroupChatMemberRole(
        chatId,
        profileId,
        role,
      );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_ROLE_UPDATED, {
        id: groupMember.id,
        role: groupMember.role,
        isMuted: groupMember.isMuted,
        isBanned: groupMember.isBanned,
        groupChat: groupMember.groupChat,
        profile: groupMember.profile,
      } as GroupMemberDto);

    return {
      updated: groupMember.updated,
      affected: groupMember.affected,
    } as GroupMemberUpdatedResponseDto;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatManagementGuard)
  @Delete('group/:chatId/member/:profileId')
  async kickGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDeletedResponseDto> {
    const deletedResponseAndMember: GroupMemberDeletedResponseDto &
      GroupMemberDto = await this.groupChatService.removeMemberFromGroupChat(
      chatId,
      profileId,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.KICKED_GROUP_CHAT_MEMBER, {
        id: deletedResponseAndMember.id,
        role: deletedResponseAndMember.role,
        isMuted: deletedResponseAndMember.isMuted,
        isBanned: deletedResponseAndMember.isBanned,
        groupChat: deletedResponseAndMember.groupChat,
        profile: deletedResponseAndMember.profile,
      } as GroupMemberDto);

    return {
      deleted: deletedResponseAndMember.deleted,
      affected: deletedResponseAndMember.affected,
    } as GroupMemberDeletedResponse;
  }

  @UseGuards(ChatManagementGuard)
  @Put('group/:chatId/mute/:profileId')
  async muteGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto> {
    const updatedResponseMember: GroupMemberUpdatedResponseDto &
      GroupMemberDto = await this.groupMemberService.muteGroupChatMember(
      chatId,
      profileId,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_MUTED, {
        id: updatedResponseMember.id,
        role: updatedResponseMember.role,
        isMuted: updatedResponseMember.isMuted,
        isBanned: updatedResponseMember.isBanned,
        groupChat: updatedResponseMember.groupChat,
        profile: updatedResponseMember.profile,
      } as GroupMemberDto);

    return {
      updated: updatedResponseMember.updated,
      affected: updatedResponseMember.affected,
    } as GroupMemberUpdatedResponseDto;
  }

  @UseGuards(ChatManagementGuard)
  @Put('group/:chatId/unmute/:profileId')
  async unmuteGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto> {
    const updatedResponseMember: GroupMemberUpdatedResponseDto &
      GroupMemberDto = await this.groupMemberService.unmuteGroupChatMember(
      chatId,
      profileId,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_UNMUTED, {
        id: updatedResponseMember.id,
        role: updatedResponseMember.role,
        isMuted: updatedResponseMember.isMuted,
        isBanned: updatedResponseMember.isBanned,
        groupChat: updatedResponseMember.groupChat,
        profile: updatedResponseMember.profile,
      } as GroupMemberDto);

    return {
      updated: updatedResponseMember.updated,
      affected: updatedResponseMember.affected,
    } as GroupMemberUpdatedResponseDto;
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/ban/:profileId')
  async banGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMemberDto: GroupMemberDto =
      await this.groupMemberService.banGroupChatMember(chatId, profileId);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_BANNED, groupMemberDto);

    return groupMemberDto;
  }

  @UseGuards(ChatManagementGuard)
  @Post('group/:chatId/unban/:profileId')
  async unbanGroupChatMember(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMemberDto: GroupMemberDto =
      await this.groupMemberService.unbanGroupChatMember(chatId, profileId);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_BANNED, groupMemberDto);

    return groupMemberDto;
  }

  //Debug routes

  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<GroupMessageDto> {
    const groupMessage: GroupMessageDto =
      await this.groupChatService.saveGroupMessage(chatId, user.id, messageDto);

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
    return await this.privateChatService.savePrivateMessage(
      user.id,
      profileId,
      messageDto,
    );
  }
}
