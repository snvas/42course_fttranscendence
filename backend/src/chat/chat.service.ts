import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket.type';
import { GroupMessageDto } from './models/group-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import {
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
  ProfileEntity,
} from '../db/entities';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ProfileService } from '../profile/profile.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { ProfileDTO } from '../profile/models/profile.dto';
import { ChatMessageDto } from './models/chat-message.dto';
import { Conversation } from './interfaces/private-conversation.interface';
import { GroupCreationDto } from './models/group-creation.dto';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { PrivateMessageDto } from './models/private-message.dto';
import { PrivateMessageHistoryDto } from './models/private-message-history.dto';
import { ConversationDto } from './models/conversation.dto';
import { PlayerStatusDto } from './models/player-status.dto';
import { PlayerStatusSocket } from './types/player-status.socket';
import { GroupChatDeletedResponseDto } from './models/group-chat-deleted-response.dto';
import { GroupMemberDeletedResponse } from './interfaces/group-member-deleted-response.interface';
import { ChatRole } from './types/chat-role.type';
import { ChatPasswordDto } from './models/chat-password.dto';
import { MessageProfile } from './interfaces/message-profile.interface';
import { PasswordUpdateResponseDto } from './models/password-update-response.dto';
import { MessageProfileDto } from './models/message-profile.dto';
import { GroupChatHistoryDto } from './models/group-chat-history.dto';
import { GroupChatDto } from './models/group-chat.dto';
import { GroupMemberDto } from './models/group-member.dto';
import { UpdateMemberRoleDto } from './models/update-member-role.dto';
import { MemberUpdatedResponseDto } from './models/member-updated-response.dto';
import { GroupProfileDto } from './models/group-profile.dto';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);
  private playerStatusSocket: Map<number, PlayerStatusSocket> = new Map();

  constructor(
    private readonly profileService: ProfileService,
    @InjectRepository(GroupChatEntity)
    private readonly groupChatRepository: Repository<GroupChatEntity>,
    @InjectRepository(GroupMessageEntity)
    private readonly groupMessageRepository: Repository<GroupMessageEntity>,
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>,
    @InjectRepository(PrivateMessageEntity)
    private readonly privateMessageRepository: Repository<PrivateMessageEntity>,
  ) {}

  public isConnectionAuthenticated(socket: AuthenticatedSocket): boolean {
    if (
      socket.request.user === undefined ||
      socket.request.user.id === undefined
    ) {
      this.logger.warn(`### User not authenticated: [${socket.id}]`);
      socket.emit('unauthorized', 'User not authenticated');
      socket.disconnect();
      return false;
    }

    return true;
  }

  public async setPlayerStatus(
    socket: AuthenticatedSocket,
    status: string,
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    const onlineUser: PlayerStatusSocket = {
      id: profile.id,
      nickname: profile.nickname,
      avatarId: profile.avatarId,
      status,
      socket,
    };

    this.playerStatusSocket.set(profile.id, onlineUser);
  }

  public async removePlayerStatus(socket: AuthenticatedSocket): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    this.playerStatusSocket.delete(profile.id);
  }

  public async getPlayersStatus(): Promise<PlayerStatusDto[]> {
    const onlineUserSocket: PlayerStatusSocket[] = Array.from(
      this.playerStatusSocket.values(),
    );

    const playerStatus: PlayerStatusDto[] = onlineUserSocket.map(
      (onlineUser: PlayerStatusSocket): PlayerStatusDto => {
        return {
          id: onlineUser.id,
          nickname: onlineUser.nickname,
          status: onlineUser.status,
          avatarId: onlineUser.avatarId,
        } as PlayerStatusDto;
      },
    );

    this.logger.debug(
      `### Online users nicknames: [${playerStatus.map(
        (u: PlayerStatusDto) => u.nickname,
      )}]`,
    );

    return playerStatus;
  }

  public async getPlayerSocket(
    profileId: number,
  ): Promise<AuthenticatedSocket | undefined> {
    return this.playerStatusSocket.get(profileId)?.socket;
  }

  public async addPlayerRoom(profileId: number, room: string): Promise<void> {
    const socket: AuthenticatedSocket | undefined = await this.getPlayerSocket(
      profileId,
    );

    if (!socket) {
      return;
    }

    socket.join(room);

    this.logger.verbose(`### Player [${profileId}] joined room [${room}]`);
  }

  public async removePlayerRoom(
    profileId: number,
    room: string,
  ): Promise<void> {
    const socket: AuthenticatedSocket | undefined = await this.getPlayerSocket(
      profileId,
    );

    if (!socket) {
      return;
    }

    socket.leave(room);
  }

  async handlePrivateMessage(
    privateMessageDto: PrivateMessageDto,
  ): Promise<PrivateMessageDto> {
    const sender: ProfileDTO = await this.profileService.findByProfileId(
      privateMessageDto.sender.id,
    );
    const receiver: ProfileDTO = await this.profileService.findByProfileId(
      privateMessageDto.receiver.id,
    );

    const privateMessageEntity: PrivateMessageEntity =
      this.privateMessageRepository.create({
        sender,
        receiver,
        message: privateMessageDto.message,
      });

    this.logger.debug(
      `### Saving private message by: [${privateMessageDto.sender.nickname}] to [${privateMessageDto.receiver.nickname}]`,
    );

    return plainToClass(
      PrivateMessageDto,
      await this.privateMessageRepository.save(privateMessageEntity),
    );
  }

  public async handleGroupMessage(
    socket: AuthenticatedSocket,
    groupMessageDto: GroupMessageDto,
  ): Promise<GroupMessageDto> {
    const user: FortyTwoUserDto = socket.request.user as FortyTwoUserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);
    const groupChat: GroupChatEntity = await this.getGroupChatById(
      groupMessageDto.groupChat.id,
    );

    if (await this.isNotMutedGroupMember(groupChat.id, user.id)) {
      this.logger.error(
        `### Cant sent message: user [${user.id}] is not a member or is muted in group chat [${groupChat.id}]`,
      );
      throw new UnauthorizedException(
        `Only non muted members of group chat can send messages`,
      );
    }

    const messageEntity: GroupMessageEntity =
      this.groupMessageRepository.create({
        groupChat,
        message: groupMessageDto.message,
        sender: profile,
      });

    const groupMessageEntity: GroupMessageEntity =
      await this.groupMessageRepository.save(messageEntity);

    this.logger.verbose(
      `### Event message: [${JSON.stringify(groupMessageEntity)}]`,
    );

    return plainToClass(GroupMessageDto, groupMessageEntity);
  }

  public async getPlayerChatRooms(
    socket: AuthenticatedSocket,
  ): Promise<string[]> {
    const rooms: string[] = await this.getUserGroupChatsHistory(
      socket.request.user.id,
    ).then((groupChatHistory: GroupChatHistoryDto[]): string[] =>
      groupChatHistory.map(
        (groupChat: GroupChatHistoryDto): string => `${groupChat.id}`,
      ),
    );

    this.logger.debug(
      `### User [${socket.request.user.id}] group chat rooms: [${rooms}]`,
    );

    return rooms;
  }

  public async saveGroupMessage(
    chatId: number,
    userId: number,
    message: ChatMessageDto,
  ): Promise<GroupMessageDto> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    if (
      groupChat.members.filter(
        (m: GroupMemberEntity): boolean => m.profile.id === profile.id,
      ).length === 0
    ) {
      throw new UnauthorizedException(
        `Only members of group chat can send messages`,
      );
    }

    const groupMessageEntity: GroupMessageEntity =
      this.groupMessageRepository.create({
        message: message.message,
        groupChat,
        sender: profile,
      });

    this.logger.verbose(
      `### Saving group message by: [${profile.nickname}] to group [${groupChat.name}]`,
    );

    return plainToClass(
      GroupMessageDto,
      await this.groupMessageRepository.save(groupMessageEntity),
    );
  }

  public async getUserPrivateMessagesHistory(
    userId: number,
  ): Promise<PrivateMessageHistoryDto[]> {
    const profiles: ProfileDTO[] = await this.getUserPrivateMessagesProfiles(
      userId,
    );

    const privateMessagesPromises: Promise<PrivateMessageHistoryDto>[] =
      profiles.map(
        async (profile: ProfileDTO): Promise<PrivateMessageHistoryDto> => {
          const messages: ConversationDto[] = await this.getUserPrivateMessages(
            userId,
            profile.id,
          );
          return {
            id: profile.id,
            nickname: profile.nickname,
            avatarId: profile.avatarId,
            messages,
          } as PrivateMessageHistoryDto;
        },
      );

    return plainToInstance(
      PrivateMessageHistoryDto,
      await Promise.all(privateMessagesPromises),
    );
  }

  public async getUserGroupChatsHistory(
    userId: number,
  ): Promise<GroupChatHistoryDto[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    this.logger.verbose(`### Getting group chats for user: [${userId}]`);

    const groupChats: GroupChatEntity[] = await this.groupChatRepository.find({
      relations: {
        owner: true,
        members: {
          profile: true,
        },
        bannedMembers: {
          profile: true,
        },
        messages: true,
      },
      where: {
        members: {
          profile: {
            id: profile.id,
          },
        },
      },
    });

    return groupChats.map((groupChat: GroupChatEntity): GroupChatHistoryDto => {
      return {
        id: groupChat.id,
        name: groupChat.name,
        visibility: groupChat.visibility,
        owner: groupChat.owner.nickname,
        createdAt: groupChat.createdAt,
        members: this.createGroupProfileDto(groupChat.members),
        bannedMembers: this.createGroupProfileDto(groupChat.bannedMembers),
        messages: groupChat.messages
          .map((message: GroupMessageEntity): ConversationDto => {
            return {
              id: message.id,
              message: message.message,
              createdAt: message.createdAt,
              sender: {
                id: message.sender.id,
                nickname: message.sender.nickname,
                avatarId: message.sender.avatarId,
              } as MessageProfile,
            };
          })
          .sort((a: ConversationDto, b: ConversationDto) => {
            return a.createdAt.getTime() - b.createdAt.getTime();
          }),
      } as GroupChatHistoryDto;
    });
  }

  public async createGroupChat(
    groupCreationDto: GroupCreationDto,
    userId: number,
  ): Promise<GroupChatDto> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    const password: string | undefined = groupCreationDto.password
      ? hashPassword(groupCreationDto.password)
      : undefined;

    const groupChat: GroupChatEntity = this.groupChatRepository.create({
      name: groupCreationDto.name,
      owner: profile,
      visibility: password ? 'private' : 'public',
      password: password,
    });

    try {
      const groupChatEntity: GroupChatEntity =
        await this.groupChatRepository.save(groupChat);

      const chatRole: ChatRole = {
        role: 'admin',
      };

      await this.addGroupChatMember(groupChatEntity.id, profile.id, chatRole);

      this.logger.debug(
        `### Group chat created with name: [${groupChatEntity.name}], visibility: [${groupChatEntity.visibility}] - by [${profile.nickname}]`,
      );

      return this.createGroupChatDto(groupChatEntity, profile);
    } catch (exception) {
      if (
        exception instanceof QueryFailedError &&
        (await this.isGroupNameExist(groupCreationDto.name))
      ) {
        throw new NotAcceptableException(
          `Group chat with name [${groupCreationDto.name}] already exists`,
        );
      }

      this.logger.error(exception);
      throw exception;
    }
  }

  public async joinGroupChat(
    chatId: number,
    userId: number,
    requestPassword: Partial<ChatPasswordDto>,
  ): Promise<GroupMemberDto> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    if (await this.isGroupMember(groupChat.id, profile.id)) {
      this.logger.error(
        `### User [${profile.nickname}] is already a member of group chat [${groupChat.name}]`,
      );
      throw new NotAcceptableException(
        `User is already a member of group chat`,
      );
    }

    if (groupChat.visibility === 'private') {
      if (!groupChat.password) {
        this.logger.error(`### Group chat [${chatId}] has no password`);
        throw new NotAcceptableException(`Group chat has no password`);
      }

      if (!requestPassword.password) {
        this.logger.error(`### Group chat [${chatId}] password is required`);
        throw new UnauthorizedException(`Group chat password is required`);
      }

      const result: boolean = comparePassword(
        requestPassword.password,
        groupChat.password,
      );

      if (!result) {
        this.logger.error(`### Group chat [${chatId}] password is invalid`);
        throw new UnauthorizedException(`Group chat password is invalid`);
      }
    }
    const chatRole: ChatRole = {
      role: 'user',
    };

    return await this.addGroupChatMember(groupChat.id, profile.id, chatRole);
  }

  public async leaveGroupChat(
    chatId: number,
    userId: number,
  ): Promise<GroupMemberDeletedResponse & GroupMemberDto> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    if (groupChat.owner.id === profile.id) {
      this.logger.error(
        `### Group chat [${chatId}] owner [${profile.nickname}] cannot leave the chat`,
      );
      throw new NotAcceptableException(
        `Group chat owner cannot leave the chat`,
      );
    }

    return await this.removeMemberFromGroupChat(chatId, profile.id);
  }

  public async muteGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<MemberUpdatedResponseDto & GroupMemberDto> {
    return await this.handleMute(profileId, chatId, true);
  }

  public async unmuteGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<MemberUpdatedResponseDto & GroupMemberDto> {
    return await this.handleMute(profileId, chatId, false);
  }

  public async banGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<MemberUpdatedResponseDto & GroupMemberDto> {
    return await this.handleBan(profileId, chatId, true);
  }

  public async unbanGroupChatMember(
    chatId: number,
    profileId: number,
  ): Promise<MemberUpdatedResponseDto & GroupMemberDto> {
    return await this.handleBan(profileId, chatId, false);
  }

  public async changeGroupChatPassword(
    chatId: number,
    password: ChatPasswordDto,
  ): Promise<PasswordUpdateResponseDto> {
    this.logger.verbose(`### Updating group chat [${chatId}] password`);

    const updateResult: UpdateResult = await this.groupChatRepository.update(
      {
        id: chatId,
      },
      {
        password: hashPassword(password.password),
        visibility: 'private',
      },
    );

    if (!updateResult.affected) {
      this.logger.error(`### Group chat [${chatId}] not found`);
      throw new NotFoundException(`Group chat [${chatId}] not found`);
    }

    return {
      updated: updateResult.affected > 0,
      affected: updateResult.affected,
    };
  }

  public async deleteGroupChatPassword(
    chatId: number,
  ): Promise<PasswordUpdateResponseDto> {
    this.logger.verbose(`### Removing group chat [${chatId}] password`);

    const updateResult: UpdateResult = await this.groupChatRepository.update(
      {
        id: chatId,
      },
      {
        password: null,
        visibility: 'public',
      },
    );

    if (!updateResult.affected) {
      this.logger.error(`### Group chat [${chatId}] not found`);
      throw new NotFoundException(`Group chat [${chatId}] not found`);
    }

    return {
      updated: updateResult.affected > 0,
      affected: updateResult.affected,
    };
  }

  public async addGroupChatMember(
    chatId: number,
    newMemberProfileId: number,
    chatRole: ChatRole,
  ): Promise<GroupMemberDto> {
    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    const newMemberProfile: ProfileDTO =
      await this.profileService.findByProfileId(newMemberProfileId);

    const groupMember: GroupMemberEntity = this.groupMemberRepository.create({
      profile: newMemberProfile,
      role: chatRole.role,
    });

    this.logger.debug(
      `### Adding profile: [${newMemberProfile.nickname}] with role: [${groupMember.role}] to group chat: [${groupChat.name}]`,
    );
    try {
      groupMember.profile = newMemberProfile;
      groupChat.members.push(groupMember);
      await this.groupChatRepository.save(groupChat);

      this.addPlayerRoom(newMemberProfile.id, `${chatId}`);

      return this.createGroupMemberDto(
        groupMember,
        groupChat,
        newMemberProfile,
      );
    } catch (Exception) {
      if (Exception instanceof QueryFailedError) {
        this.logger.error(Exception);
        throw new NotAcceptableException(
          `Profile [${newMemberProfile.nickname}] is already a member of group chat [${groupChat.name}]`,
        );
      }
      throw Exception;
    }
  }

  public async removeMemberFromGroupChat(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberDeletedResponse & GroupMemberDto> {
    const memberToRemove: GroupMemberEntity | null =
      await this.getGroupChatMember(profileId, chatId);

    const memberDeleteResult: DeleteResult =
      await this.groupMemberRepository.delete(memberToRemove.id);

    if (!memberDeleteResult.affected) {
      throw new InternalServerErrorException('Member not deleted');
    }
    this.logger.log(
      `### Kicked member [${profileId}] from Group chat [${chatId}]`,
    );

    this.removePlayerRoom(profileId, `${chatId}`);

    return {
      deleted: memberDeleteResult.affected > 0,
      affected: memberDeleteResult.affected,
      ...this.createGroupMemberDto(
        memberToRemove,
        memberToRemove.groupChat,
        memberToRemove.profile,
      ),
    };
  }

  public async getGroupChatById(id: number): Promise<GroupChatEntity> {
    this.logger.verbose(`### Getting group chat by id: [${id}]`);

    const groupChat: GroupChatEntity | null =
      await this.groupChatRepository.findOne({
        where: {
          id,
        },
        relations: {
          owner: true,
          members: {
            profile: true,
          },
        },
      });

    if (!groupChat) {
      throw new NotFoundException(`Group chat with id [${id}] not found`);
    }

    return groupChat;
  }

  public async deleteGroupChatById(
    id: number,
  ): Promise<GroupChatDeletedResponseDto> {
    this.logger.verbose(`### Deleting group chat by id: [${id}]`);

    const groupChatDeleteResult: DeleteResult =
      await this.groupChatRepository.delete({
        id,
      });

    if (!groupChatDeleteResult.affected) {
      this.logger.log(`### Group chat with id [${id}] not found`);
      throw new NotFoundException(`Group chat with id ${id} not found`);
    }

    this.logger.log(`### Group chat [${id}] deleted`);

    return {
      deleted: groupChatDeleteResult.affected > 0,
      affected: groupChatDeleteResult.affected,
    };
  }

  public async getAllGroupChats(): Promise<GroupChatDto[]> {
    this.logger.verbose(`### Getting group all chats`);

    const groupChats: GroupChatEntity[] | null =
      await this.groupChatRepository.find({
        relations: {
          owner: true,
          members: {
            profile: true,
          },
        },
      });

    if (!groupChats) {
      throw new NotFoundException(`Group chats not found`);
    }

    return groupChats.map(
      (groupChat: GroupChatEntity): GroupChatDto =>
        this.createGroupChatDto(groupChat, groupChat.owner),
    );
  }

  public async savePrivateMessage(
    senderUserId: number,
    receiverProfileId: number,
    message: ChatMessageDto,
  ): Promise<PrivateMessageDto> {
    const sender: ProfileDTO = await this.profileService.findByUserId(
      senderUserId,
    );
    const receiver: ProfileDTO = await this.profileService.findByProfileId(
      receiverProfileId,
    );

    const privateMessageEntity: PrivateMessageEntity =
      this.privateMessageRepository.create({
        sender,
        receiver,
        message: message.message,
      });

    this.logger.debug(
      `### Saving private message by: [${sender.nickname}] to [${receiver.nickname}]`,
    );

    return plainToClass(
      PrivateMessageDto,
      await this.privateMessageRepository.save(privateMessageEntity),
    );
  }

  public async updateGroupChatMemberRole(
    chatId: number,
    profileId: number,
    chatRole: UpdateMemberRoleDto,
  ): Promise<GroupMemberDto & MemberUpdatedResponseDto> {
    this.logger.verbose(`### Updating group chat [${chatId}] member role`);

    const groupMember: GroupMemberEntity = await this.getGroupChatMember(
      profileId,
      chatId,
    );

    const updatedMember: UpdateResult = await this.groupMemberRepository.update(
      {
        id: groupMember.id,
      },
      {
        role: chatRole.role,
      },
    );

    if (!updatedMember.affected) {
      this.logger.error(`### Role of member [${profileId}] not updated`);
      throw new InternalServerErrorException('Member not updated');
    }

    return {
      updated: updatedMember.affected > 0,
      affected: updatedMember.affected,
      ...this.createGroupMemberDto(
        groupMember,
        groupMember.groupChat,
        groupMember.profile,
      ),
    };
  }

  public async getGroupMemberRole(
    chatId: number,
    profileId: number,
  ): Promise<ChatRole> {
    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    if (profileId === groupChat.owner.id) {
      return { role: 'owner' };
    }

    const groupMember: GroupMemberEntity = await this.getGroupChatMember(
      profileId,
      chatId,
    );

    return groupMember.role === 'admin' ? { role: 'admin' } : { role: 'user' };
  }

  public async getGroupChatDtoById(id: number): Promise<GroupChatDto> {
    const groupChat: GroupChatEntity = await this.getGroupChatById(id);

    return this.createGroupChatDto(groupChat, groupChat.owner);
  }

  private async handleMute(
    profileId: number,
    chatId: number,
    mute: boolean,
  ): Promise<MemberUpdatedResponseDto & GroupMemberDto> {
    const groupMember: GroupMemberEntity = await this.getGroupChatMember(
      profileId,
      chatId,
    );

    const updatedMemberResult: UpdateResult =
      await this.groupMemberRepository.update(
        {
          id: groupMember.id,
        },
        {
          isMuted: mute,
        },
      );

    if (!updatedMemberResult.affected) {
      this.logger.error(
        `### Member [${profileId}] not mute status not update to [${mute}]`,
      );
      throw new InternalServerErrorException('Member not muted');
    }

    this.logger.verbose(
      `### Member [${profileId}] mute status changed to [${mute}]`,
    );

    return {
      updated: updatedMemberResult.affected > 0,
      affected: updatedMemberResult.affected,
      ...this.createGroupMemberDto(
        groupMember,
        groupMember.groupChat,
        groupMember.profile,
      ),
    };
  }

  private async handleBan(
    profileId: number,
    chatId: number,
    ban: boolean,
  ): Promise<MemberUpdatedResponseDto & GroupMemberDto> {
    const groupMember: GroupMemberEntity = await this.getGroupChatMember(
      profileId,
      chatId,
    );

    const updatedMemberResult: UpdateResult =
      await this.groupChatRepository.update(
        {
          id: chatId,
        },
        {
          bannedMembers: ban
            ? [...groupMember.groupChat.bannedMembers, groupMember]
            : groupMember.groupChat.bannedMembers.filter(
                (m: GroupMemberEntity) => m.id !== groupMember.id,
              ),
        },
      );

    if (!updatedMemberResult.affected) {
      this.logger.error(
        `### Member [${profileId}] not ban status not update to [${ban}]`,
      );
      throw new InternalServerErrorException('Member not banned');
    }

    return {
      updated: updatedMemberResult.affected > 0,
      affected: updatedMemberResult.affected,
      ...this.createGroupMemberDto(
        groupMember,
        groupMember.groupChat,
        groupMember.profile,
      ),
    };
  }

  private async getGroupChatMember(
    profileId: number,
    chatId: number,
  ): Promise<GroupMemberEntity> {
    const groupMember: GroupMemberEntity | null =
      await this.groupMemberRepository.findOne({
        where: {
          profile: {
            id: profileId,
          },
          groupChat: {
            id: chatId,
          },
        },
        relations: {
          groupChat: {
            owner: true,
          },
          profile: true,
        },
      });

    if (!groupMember) {
      this.logger.log(
        `### Member [${profileId}] for chat with id [${chatId}] not found`,
      );
      throw new NotFoundException(
        `Member [${profileId}] for group chat with id [${chatId}] not found`,
      );
    }

    return groupMember;
  }

  private async getUserPrivateMessages(
    userId: number,
    withProfileId: number,
  ): Promise<ConversationDto[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    this.logger.verbose(`### Getting private messages for user: [${userId}]`);

    const messages: PrivateMessageEntity[] =
      await this.privateMessageRepository.find({
        where: [
          {
            sender: {
              id: profile.id,
            },
            receiver: {
              id: withProfileId,
            },
          },
          {
            sender: {
              id: withProfileId,
            },
            receiver: {
              id: profile.id,
            },
          },
        ],
        order: { createdAt: 'ASC' },
        relations: {
          sender: true,
        },
      });

    return messages.map((message: PrivateMessageEntity): Conversation => {
      return {
        id: message.id,
        message: message.message,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          nickname: message.sender.nickname,
          avatarId: message.sender.avatarId,
        } as MessageProfile,
      };
    });
  }

  private async getUserPrivateMessagesProfiles(
    userId: number,
  ): Promise<ProfileDTO[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    this.logger.verbose(
      `### Getting private profiles for: [${userId}] messages`,
    );

    const privateMessagesSent: PrivateMessageEntity[] =
      await this.privateMessageRepository.find({
        relations: { receiver: true },
        where: {
          sender: {
            id: profile.id,
          },
        },
      });

    const privateMessagesReceived: PrivateMessageEntity[] =
      await this.privateMessageRepository.find({
        relations: { sender: true },
        where: {
          receiver: {
            id: profile.id,
          },
        },
      });

    const profilesWithConversations: ProfileEntity[] = [
      ...privateMessagesSent.map(
        (message: PrivateMessageEntity) => message.receiver,
      ),
      ...privateMessagesReceived.map(
        (message: PrivateMessageEntity) => message.sender,
      ),
    ];

    const uniqueProfiles: ProfileEntity[] = profilesWithConversations.filter(
      (p: ProfileEntity, index: number): boolean => {
        return (
          index ===
          profilesWithConversations.findIndex(
            (o: ProfileEntity): boolean => p.nickname === o.nickname,
          )
        );
      },
    );

    return plainToInstance(ProfileDTO, uniqueProfiles);
  }

  private async isGroupNameExist(name: string): Promise<boolean> {
    const groupChatEntity: GroupChatEntity | null =
      await this.groupChatRepository.findOneBy({
        name,
      });

    return !!groupChatEntity;
  }

  private async isNotMutedGroupMember(
    chatId: number,
    userId: number,
  ): Promise<boolean> {
    const groupMember: GroupMemberEntity | null =
      await this.groupMemberRepository.findOneBy([
        {
          profile: {
            id: userId,
          },
          groupChat: {
            id: chatId,
          },
          isMuted: false,
        },
      ]);

    return !!groupMember;
  }

  private async isGroupMember(
    chatId: number,
    userId: number,
  ): Promise<boolean> {
    const groupMember: GroupMemberEntity | null =
      await this.groupMemberRepository.findOneBy([
        {
          profile: {
            userEntity: {
              id: userId,
            },
          },
          groupChat: {
            id: chatId,
          },
        },
      ]);

    return !!groupMember;
  }

  private createGroupMemberDto(
    memberEntity: GroupMemberEntity,
    groupChat: GroupChatEntity,
    newMemberProfile: ProfileDTO,
  ): GroupMemberDto {
    return {
      id: memberEntity.id,
      role: memberEntity.role,
      isMuted: memberEntity.isMuted,
      groupChat: {
        id: groupChat.id,
        name: groupChat.name,
        visibility: groupChat.visibility,
        owner: {
          id: groupChat.owner.id,
          nickname: groupChat.owner.nickname,
          avatarId: groupChat.owner.avatarId,
        } as MessageProfileDto,
      } as GroupChatDto,
      profile: {
        id: newMemberProfile.id,
        nickname: newMemberProfile.nickname,
        avatarId: newMemberProfile.avatarId,
      } as MessageProfileDto,
    };
  }

  private createGroupChatDto(
    groupChatEntity: GroupChatEntity,
    profile: ProfileDTO,
  ): GroupChatDto {
    return {
      id: groupChatEntity.id,
      name: groupChatEntity.name,
      visibility: groupChatEntity.visibility,
      owner: {
        id: profile.id,
        nickname: profile.nickname,
        avatarId: profile.avatarId,
      } as MessageProfile,
    } as GroupChatDto;
  }

  private createGroupProfileDto(
    memberEntity: GroupMemberEntity[],
  ): GroupProfileDto[] {
    return memberEntity.map((member: GroupMemberEntity): GroupProfileDto => {
      return {
        id: member.id,
        profile: {
          id: member.profile.id,
          nickname: member.profile.nickname,
          avatarId: member.profile.avatarId,
        },
        role: member.role,
        isMuted: member.isMuted,
      } as GroupProfileDto;
    });
  }
}
