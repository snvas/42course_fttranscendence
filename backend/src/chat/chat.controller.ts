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
import { GroupChatMemberEventDto } from './models/group-chat-member-event.dto';
import { GroupChatEvent } from './interfaces/group-chat-event.interface';
import { GroupChatHistoryDto } from './models/group-chat-history.dto';
import { GroupChatDto } from './models/group-chat.dto';
import { GroupMemberDto } from './models/group-member.dto';
import { socketEvent } from '../utils/socket-events';
import { GroupChatMemberEvent } from './interfaces/group-chat-member-event.interface';

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
    const GroupChat: GroupChatDto = await this.chatService.createGroupChat(
      groupCreationDto,
      user.id,
    );

    (await this.messageGateway.getServer()).emit(
      socketEvent.GROUP_CHAT_CREATED,
      GroupChat,
    );

    return GroupChat;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId')
  async deleteGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<GroupChatDeletedResponseDto> {
    const deletedResponse: GroupChatDeletedResponseDto =
      await this.chatService.deleteGroupChatById(chatId);

    (await this.messageGateway.getServer()).emit(
      socketEvent.GROUP_CHAT_DELETED,
      {
        chatId,
      } as GroupChatEvent,
    );

    return deletedResponse;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/join')
  async joinGroupChat(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: Partial<ChatPasswordDto>,
  ): Promise<GroupMemberDto> {
    const groupMemberDto: GroupMemberDto = await this.chatService.joinGroupChat(
      chatId,
      user.id,
      password,
    );

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.JOINED_GROUP_CHAT_MEMBER, {
        chatId,
        profileId: groupMemberDto.member.id,
        role: groupMemberDto.role,
      } as GroupChatMemberEventDto);

    return groupMemberDto;
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
        chatId,
        profileId: deletedResponseAndMember.member.id,
        role: deletedResponseAndMember.role,
      } as GroupChatMemberEvent);
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
      } as GroupChatEvent);

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
      .emit(socketEvent.ADDED_GROUP_CHAT_MEMBER, {
        chatId,
        profileId,
        role: groupMember.role,
      } as GroupChatMemberEventDto);

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
      .emit(socketEvent.ADDED_GROUP_CHAT_MEMBER, {
        chatId,
        profileId,
        role: groupMember.role,
      } as GroupChatMemberEventDto);

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
        chatId,
        profileId,
        role: deletedResponseAndMember.role,
      } as GroupChatMemberEventDto);

    return {
      deleted: deletedResponseAndMember.deleted,
      affected: deletedResponseAndMember.affected,
    } as GroupMemberDeletedResponse;
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

  //TODO: add server.to(chatId).emit() to send message to all group members for test
  @HttpCode(HttpStatus.CREATED)
  @Post('group/:chatId/message')
  async saveGroupMessage(
    @Req() { user }: { user: FortyTwoUserDto },
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() messageDto: ChatMessageDto,
  ): Promise<GroupMessageDto> {
    return await this.chatService.saveGroupMessage(chatId, user.id, messageDto);
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
