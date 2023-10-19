import {
  Injectable,
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
import { hashPassword } from '../utils/bcrypt';
import { PrivateMessageDto } from './models/private-message.dto';
import { PrivateMessageHistoryDto } from './models/private-message-history.dto';
import { ConversationDto } from './models/conversation.dto';
import { GroupChatHistoryDto } from './models/group-chat-history.dto';
import { GroupChatDto } from './models/group-chat.dto';
import { GroupMemberDto } from './models/group-member.dto';
import { PlayerStatusDto } from './models/player-status.dto';
import { PlayerStatusSocket } from './types/player-status.socket';
import { GroupChatDeletedResponseDto } from './models/group-chat-deleted-response.dto';
import { GroupMemberDeletedResponse } from './interfaces/group-member-deleted-response.interface';
import { ChatRole } from './types/chat-role.type';
import { ChatPasswordDto } from './models/chat-password.dto';
import { MessageProfile } from './interfaces/message-profile.interface';
import { PasswordUpdateResponseDto } from './models/password-update-response.dto';

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
      this.logger.warn(`### User not authenticated: ${socket.id}`);
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
      `### Online users nicknames: ${playerStatus.map(
        (u: PlayerStatusDto) => u.nickname,
      )}`,
    );

    return playerStatus;
  }

  public async getPlayerSocketId(
    profileId: number,
  ): Promise<string | undefined> {
    const profile: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    return this.playerStatusSocket.get(profile.id)?.socket.id;
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
      `### Saving private message by: ${privateMessageDto.sender.nickname} to ${privateMessageDto.receiver.nickname}`,
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
    const groupChat: GroupChatDto = await this.getGroupChatById(
      groupMessageDto.groupChat.id,
    );

    if (await this.isGroupMember(groupChat.id, user.id)) {
      this.logger.error(
        `### User [${user.id}] is not a member of group chat [${groupChat.id}] for sending messages`,
      );
      throw new UnauthorizedException(
        `Only members of group chat can send messages`,
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
      `### Event message: ${JSON.stringify(groupMessageEntity)}`,
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
        (groupChat: GroupChatHistoryDto): string => groupChat.name,
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
    const groupChat: GroupChatDto = await this.getGroupChatById(chatId);

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
      `### Saving group message by: ${profile.nickname} to group ${groupChat.name}}`,
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

    const groupMemberships: GroupMemberEntity[] =
      await this.groupMemberRepository.find({
        relations: {
          groupChat: {
            owner: true,
            members: {
              profile: true,
            },
            messages: {
              sender: true,
            },
          },
        },
        where: {
          profile: {
            id: profile.id,
          },
        },
      });

    const groupChats: GroupChatEntity[] = groupMemberships.map(
      (membership: GroupMemberEntity): GroupChatEntity => {
        return {
          ...membership.groupChat,
        };
      },
    );

    return groupChats.map((groupChat: GroupChatEntity): GroupChatHistoryDto => {
      return {
        id: groupChat.id,
        name: groupChat.name,
        visibility: groupChat.visibility,
        owner: groupChat.owner.nickname,
        createdAt: groupChat.createdAt,
        members: groupChat.members,
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
      visibility: groupCreationDto.visibility,
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
        `### Group chat created with name: ${groupChatEntity.name}, visibility: ${groupChatEntity.visibility} - by ${profile.nickname}`,
      );
      return plainToClass(GroupChatDto, groupChatEntity);
    } catch (exception) {
      if (
        exception instanceof QueryFailedError &&
        (await this.isGroupNameExist(groupCreationDto.name))
      ) {
        throw new NotAcceptableException(
          `Group chat with name ${groupCreationDto.name} already exists`,
        );
      }

      this.logger.error(exception);
      throw exception;
    }
  }

  public async changeGroupChatPassword(
    chatId: number,
    password: ChatPasswordDto,
  ): Promise<Partial<PasswordUpdateResponseDto>> {
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

    return updateResult.affected
      ? {
          updated: updateResult.affected > 0,
          affected: updateResult.affected,
        }
      : {};
  }

  public async deleteGroupChatPassword(
    chatId: number,
  ): Promise<Partial<PasswordUpdateResponseDto>> {
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

    return updateResult.affected
      ? {
          updated: updateResult.affected > 0,
          affected: updateResult.affected,
        }
      : {};
  }

  public async addGroupChatMember(
    chatId: number,
    newMemberProfileId: number,
    chatRole: ChatRole,
  ): Promise<GroupMemberDto> {
    const groupChat: GroupChatDto = await this.getGroupChatById(chatId);

    const newMemberProfile: ProfileDTO =
      await this.profileService.findByProfileId(newMemberProfileId);

    const groupMember: GroupMemberEntity = this.groupMemberRepository.create({
      groupChat,
      profile: newMemberProfile,
      role: chatRole.role,
    });
    groupMember.groupChat = groupChat;
    groupMember.profile = newMemberProfile;

    this.logger.debug(
      `### Adding profile: ${newMemberProfile.nickname} with role: ${groupMember.role} to group chat: ${groupChat.name}`,
    );
    try {
      return plainToClass(
        GroupMemberDto,
        await this.groupMemberRepository.save(groupMember),
      );
    } catch (Exception) {
      if (Exception instanceof QueryFailedError) {
        throw new NotAcceptableException(
          `Profile ${newMemberProfile.nickname} is already a member of group chat ${groupChat.name}`,
        );
      }
      throw Exception;
    }
  }

  public async kickMemberFromGroupChat(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberDeletedResponse> {
    const memberToRemove: GroupMemberEntity | null =
      await this.groupMemberRepository.findOneBy({
        profile: {
          id: profileId,
        },
      });

    const memberDeleteResult: DeleteResult =
      await this.groupMemberRepository.delete({ id: memberToRemove?.id });

    if (!memberDeleteResult.affected) {
      this.logger.log(
        `### Member [${memberToRemove?.id}] for chat with id ${chatId} not found`,
      );
      throw new NotFoundException(
        `Member [${memberToRemove?.id}] for group chat with id ${chatId} not found`,
      );
    }

    this.logger.log(`### Group chat [${chatId}] deleted`);

    return {
      deleted: memberDeleteResult.affected > 0,
      affected: memberDeleteResult.affected,
    };
  }

  public async getGroupChatById(id: number): Promise<GroupChatDto> {
    this.logger.verbose(`### Getting group chat by id: ${id}`);

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
      throw new NotFoundException(`Group chat with id ${id} not found`);
    }

    return plainToClass(GroupChatDto, groupChat);
  }

  public async deleteGroupChatById(
    id: number,
  ): Promise<GroupChatDeletedResponseDto> {
    this.logger.verbose(`### Deleting group chat by id: ${id}`);

    const groupChatDeleteResult: DeleteResult =
      await this.groupChatRepository.delete({
        id,
      });

    if (!groupChatDeleteResult.affected) {
      this.logger.log(`### Group chat with id ${id} not found`);
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

    const groupChat: GroupChatEntity[] | null =
      await this.groupChatRepository.find({
        relations: {
          owner: true,
          members: {
            profile: true,
          },
        },
      });

    if (!groupChat) {
      throw new NotFoundException(`Group chats not found`);
    }

    return plainToInstance(GroupChatDto, groupChat);
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
      `### Saving private message by: ${sender.nickname} to ${receiver.nickname}`,
    );

    return plainToClass(
      PrivateMessageDto,
      await this.privateMessageRepository.save(privateMessageEntity),
    );
  }

  public async getGroupMemberRole(
    chatId: number,
    profileId: number,
  ): Promise<ChatRole> {
    const groupChat: GroupChatDto = await this.getGroupChatById(chatId);

    if (profileId === groupChat.owner.id) {
      return { role: 'owner' };
    }

    const groupMember: GroupMemberEntity | null =
      await this.groupMemberRepository.findOneBy([
        {
          profile: {
            id: profileId,
          },
          groupChat: {
            id: chatId,
          },
        },
      ]);

    if (!groupMember) {
      this.logger.error(
        `### Profile id [${profileId}] is not a member from chat [${chatId}]`,
      );
      throw new NotAcceptableException(
        `Profile id [${profileId}] is not a member from chat [${chatId}]`,
      );
    }

    return groupMember.role === 'admin' ? { role: 'admin' } : { role: 'user' };
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
}
