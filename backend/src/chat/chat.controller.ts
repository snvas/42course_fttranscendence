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
import { PasswordUpdateResponseDto } from './models/password-update-response.dto';
import { ChatPasswordDto } from './models/chat-password.dto';
import { ChatGateway } from './chat.gateway';
import { GroupChatMemberEventDto } from './models/group-chat-member-event.dto';
import { GroupChatEvent } from './interfaces/group-chat-event.interface';

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
    const groupCreation: GroupChatDto = await this.chatService.createGroupChat(
      groupCreationDto,
      user.id,
    );

    (await this.messageGateway.getServer())
      .to(`${groupCreation.id}`)
      .emit('groupChatCreated', {
        chatId: groupCreation.id,
      } as GroupChatEvent);

    return groupCreation;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Delete('group/:chatId')
  async deleteGroupChat(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<GroupChatDeletedResponseDto> {
    const deletedResponse: GroupChatDeletedResponseDto =
      await this.chatService.deleteGroupChatById(chatId);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit('groupChatDeleted', {
        chatId,
      } as GroupChatEvent);

    return deletedResponse;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('group/:chatId/password/validate')
  async validateGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: ChatPasswordDto,
  ): Promise<void> {
    return await this.chatService.validateGroupChatPassword(chatId, password);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ChatOwnerGuard)
  @Put('group/:chatId/password')
  async updateGroupChatPassword(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() password: ChatPasswordDto,
  ): Promise<Partial<PasswordUpdateResponseDto>> {
    const passwordUpdate: Partial<PasswordUpdateResponseDto> =
      await this.chatService.changeGroupChatPassword(chatId, password);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit('groupPasswordUpdated', {
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

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit('groupPasswordDeleted', {
        chatId,
      } as GroupChatEvent);

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
      .emit('addedGroupChatMember', {
        chatId,
        profileId,
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
      .emit('addedGroupChatMember', {
        chatId,
        profileId,
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
    const deletedResponse: GroupMemberDeletedResponse =
      await this.chatService.kickMemberFromGroupChat(chatId, profileId);

    (await this.messageGateway.getServer())
      .to(`${chatId}`)
      .emit('kickedGroupMember', {
        chatId,
        profileId,
      } as GroupChatMemberEventDto);

    return deletedResponse;
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
