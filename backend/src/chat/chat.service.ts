import { Injectable, Logger } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { StatusService } from '../status/status.service';
import { PrivateChatService } from './services/private-chat.service';
import { GroupChatService } from './services/group-chat.service';
import { GroupMemberService } from './services/group-member.service';
import { PrivateMessageHistoryDto } from './models/private/private-message-history.dto';
import { GroupChatHistoryDto } from './models/group/group-chat-history.dto';
import { GroupCreationDto } from './models/group/group-creation.dto';
import { GroupChatDto } from './models/group/group-chat.dto';
import { socketEvent } from '../ws/ws-events';
import { GroupChatDeletedResponseDto } from './models/group/group-chat-deleted-response.dto';
import { Server } from 'socket.io';
import { GroupChatEventDto } from './models/group/group-chat-event.dto';
import { GroupMemberDto } from './models/group/group-member.dto';
import { GroupChatPasswordDto } from './models/group/group-chat-password.dto';
import { GroupChatUpdatedResponseDto } from './models/group/group-chat-updated-response.dto';
import { ChatRole } from './types/chat-role.type';
import { GroupMemberDeletedResponse } from './interfaces/group/group-member-deleted-response.interface';
import { GroupMemberDeletedResponseDto } from './models/group/group-member-deleted-response.dto';
import { GroupMemberUpdatedResponseDto } from './models/group/group-member-updated-response.dto';
import { GroupMemberRoleUpdateDto } from './models/group/group-member-role-update.dto';
import { GroupMessageDto } from './models/group/group-message.dto';
import { WsGateway } from '../ws/ws.gateway';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly statusService: StatusService,
    private readonly privateChatService: PrivateChatService,
    private readonly groupChatService: GroupChatService,
    private readonly groupMemberService: GroupMemberService,
    private readonly wsGateway: WsGateway,
  ) {}

  public async getPrivateMessageHistory(
    userId: number,
  ): Promise<PrivateMessageHistoryDto[]> {
    return await this.privateChatService.getMessageHistory(userId);
  }

  public async getGroupMessageHistory(
    userId: number,
  ): Promise<GroupChatHistoryDto[]> {
    return await this.groupChatService.getMessageHistory(userId);
  }

  public async getAllGroupChats(): Promise<GroupChatDto[]> {
    return await this.groupChatService.getAllGroupChats();
  }

  public async createGroupChat(
    groupCreationDto: GroupCreationDto,
    userId: number,
  ): Promise<any> {
    const groupChat: GroupChatDto = await this.groupChatService.create(
      groupCreationDto,
      userId,
    );

    (await this.wsGateway.getServer()).emit(
      socketEvent.GROUP_CHAT_CREATED,
      groupChat,
    );

    return groupChat;
  }

  public async deleteGroupChat(
    chatId: number,
  ): Promise<GroupChatDeletedResponseDto> {
    const deletedResponse: GroupChatDeletedResponseDto =
      await this.groupChatService.deleteById(chatId);

    const server: Server = await this.wsGateway.getServer();

    server.emit(socketEvent.GROUP_CHAT_DELETED, {
      chatId,
    } as GroupChatEventDto);

    server.in(`${chatId}`).disconnectSockets();

    return deletedResponse;
  }

  public async joinGroupChat(
    chatId: number,
    userId: number,
    password: Partial<GroupChatPasswordDto>,
  ): Promise<any> {
    const groupMember: GroupMemberDto = await this.groupChatService.join(
      chatId,
      userId,
      password,
    );

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.JOINED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  public async leaveGroupChat(chatId: number, userId: number): Promise<any> {
    const deletedResponseAndMember: GroupMemberDeletedResponse &
      GroupMemberDto = await this.groupChatService.leave(chatId, userId);

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(
        socketEvent.LEAVE_GROUP_CHAT_MEMBER,
        this.extractGroupMemberDto(deletedResponseAndMember),
      );
  }

  public async updateGroupChatPassword(
    chatId: number,
    password: GroupChatPasswordDto,
  ): Promise<GroupChatUpdatedResponseDto> {
    const passwordUpdate: GroupChatUpdatedResponseDto =
      await this.groupChatService.changePassword(chatId, password);

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_PASSWORD_UPDATED, {
        chatId,
      } as GroupChatEventDto);

    return passwordUpdate;
  }

  public async deleteGroupChatPassword(
    chatId: number,
  ): Promise<GroupChatUpdatedResponseDto> {
    const passwordUpdate: GroupChatUpdatedResponseDto =
      await this.groupChatService.deletePassword(chatId);

    const groupChat: GroupChatDto =
      await this.groupChatService.getGroupChatDtoById(chatId);
    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_PASSWORD_DELETED, groupChat);

    return passwordUpdate;
  }

  public async addGroupChatMember(
    chatId: number,
    profileId: number,
    chatRole: ChatRole,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberDto = await this.groupChatService.addMember(
      chatId,
      profileId,
      chatRole,
    );

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.ADDED_GROUP_CHAT_MEMBER, groupMember);

    return groupMember;
  }

  public async kickGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberDeletedResponse> {
    const deletedResponseAndMember: GroupMemberDeletedResponseDto &
      GroupMemberDto = await this.groupMemberService.removeMember(
      await this.groupChatService.getGroupChatById(chatId),
      await this.profileService.findByProfileId(profileId),
    );

    const groupMemberDto: GroupMemberDto = this.extractGroupMemberDto(
      deletedResponseAndMember,
    );

    const server: Server = await this.wsGateway.getServer();

    server
      .to(`${chatId}`)
      .emit(socketEvent.KICKED_GROUP_CHAT_MEMBER, groupMemberDto);

    server
      .to(`${(await this.statusService.getSocket(profileId))?.id}`)
      .emit(socketEvent.KICKED_GROUP_CHAT_MEMBER, groupMemberDto);

    return {
      deleted: deletedResponseAndMember.deleted,
      affected: deletedResponseAndMember.affected,
    } as GroupMemberDeletedResponse;
  }

  public async updateGroupChatMemberRole(
    chatId: number,
    profileId: number,
    chatRole: GroupMemberRoleUpdateDto,
  ): Promise<GroupMemberUpdatedResponseDto> {
    const updatedResponseAndMember: GroupMemberDto &
      GroupMemberUpdatedResponseDto = await this.groupMemberService.updateRole(
      chatId,
      profileId,
      chatRole,
    );

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(
        socketEvent.GROUP_CHAT_MEMBER_ROLE_UPDATED,
        this.extractGroupMemberDto(updatedResponseAndMember),
      );

    return {
      updated: updatedResponseAndMember.updated,
      affected: updatedResponseAndMember.affected,
    } as GroupMemberUpdatedResponseDto;
  }

  public async muteGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto> {
    const updatedResponseAndMember: GroupMemberUpdatedResponseDto &
      GroupMemberDto = await this.groupMemberService.mute(chatId, profileId);

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(
        socketEvent.GROUP_CHAT_MEMBER_MUTED,
        this.extractGroupMemberDto(updatedResponseAndMember),
      );

    return {
      updated: updatedResponseAndMember.updated,
      affected: updatedResponseAndMember.affected,
    } as GroupMemberUpdatedResponseDto;
  }

  public async unmuteGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto> {
    const updatedResponseAndMember: GroupMemberUpdatedResponseDto &
      GroupMemberDto = await this.groupMemberService.unmute(chatId, profileId);

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(
        socketEvent.GROUP_CHAT_MEMBER_UNMUTED,
        this.extractGroupMemberDto(updatedResponseAndMember),
      );

    return {
      updated: updatedResponseAndMember.updated,
      affected: updatedResponseAndMember.affected,
    } as GroupMemberUpdatedResponseDto;
  }

  public async banGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMemberDto: GroupMemberDto = await this.groupMemberService.ban(
      chatId,
      profileId,
    );

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_BANNED, groupMemberDto);

    (await this.wsGateway.getServer())
      .to(`${(await this.statusService.getSocket(profileId))?.id}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_BANNED, groupMemberDto);

    return groupMemberDto;
  }

  public async unbanGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberDto> {
    const groupMemberDto: GroupMemberDto = await this.groupMemberService.unban(
      chatId,
      profileId,
    );

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_UNBANNED, groupMemberDto);

    (await this.wsGateway.getServer())
      .to(`${(await this.statusService.getSocket(profileId))?.id}`)
      .emit(socketEvent.GROUP_CHAT_MEMBER_UNBANNED, groupMemberDto);

    return groupMemberDto;
  }

  public async saveHttpGroupMessage(
    userId: number,
    chatId: number,
    messageDto: any,
  ): Promise<any> {
    const groupMessage: GroupMessageDto =
      await this.groupChatService.saveHttpMessage(chatId, userId, messageDto);

    (await this.wsGateway.getServer())
      .to(`${chatId}`)
      .emit(socketEvent.RECEIVE_GROUP_MESSAGE, groupMessage);

    return groupMessage;
  }

  public async saveHttpPrivateMessage(
    userId: number,
    profileId: number,
    messageDto: any,
  ): Promise<any> {
    const privateMessage: any = await this.privateChatService.saveHttpMessage(
      userId,
      profileId,
      messageDto,
    );

    (await this.wsGateway.getServer())
      .to(`${profileId}`)
      .emit(socketEvent.RECEIVE_PRIVATE_MESSAGE, privateMessage);

    return privateMessage;
  }

  private extractGroupMemberDto(
    deletedResponseAndMember: any & GroupMemberDto,
  ): GroupMemberDto {
    return {
      id: deletedResponseAndMember.id,
      role: deletedResponseAndMember.role,
      isMuted: deletedResponseAndMember.isMuted,
      isBanned: deletedResponseAndMember.isBanned,
      groupChat: deletedResponseAndMember.groupChat,
      profile: deletedResponseAndMember.profile,
    } as GroupMemberDto;
  }
}
