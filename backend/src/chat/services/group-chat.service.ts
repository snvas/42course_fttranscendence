import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedSocket } from '../types/authenticated-socket.type';
import { GroupMessageDto } from '../models/group/group-message.dto';
import { Oauth2UserDto } from '../../user/models/oauth2-user.dto';
import { ProfileDTO } from '../../profile/models/profile.dto';
import {
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  ProfileEntity,
} from '../../db/entities';
import { MessageProfileDto } from '../models/message/message-profile.dto';
import { MessageGroupChatDto } from '../models/message/message-group-chat.dto';
import { ProfileService } from '../../profile/profile.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { GroupMemberService } from './group-member.service';
import { GroupMessageService } from './group-message.service';
import { GroupChatHistoryDto } from '../models/group/group-chat-history.dto';
import { MessageConversationDto } from '../models/message/message-conversation.dto';
import { MessageProfile } from '../interfaces/message/message-profile.interface';
import { GroupProfileDto } from '../models/group/group-profile.dto';
import { MessageHttpDto } from '../models/message/message-http.dto';
import { GroupCreationDto } from '../models/group/group-creation.dto';
import { GroupChatDto } from '../models/group/group-chat.dto';
import { comparePassword, hashPassword } from '../../utils/bcrypt';
import { ChatRole } from '../types/chat-role.type';
import { GroupChatPasswordDto } from '../models/group/group-chat-password.dto';
import { GroupMemberDto } from '../models/group/group-member.dto';
import { GroupMemberDeletedResponse } from '../interfaces/group/group-member-deleted-response.interface';
import { GroupChatUpdatedResponseDto } from '../models/group/group-chat-updated-response.dto';
import { GroupChatDeletedResponseDto } from '../models/group/group-chat-deleted-response.dto';
import { SimpleProfileDto } from '../../profile/models/simple-profile.dto';
import { BlockService } from '../../social/services/block.service';
import { socketEvent } from '../../ws/ws-events';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';

@Injectable()
export class GroupChatService {
  private readonly logger: Logger = new Logger(GroupChatService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly blockService: BlockService,
    private readonly groupMemberService: GroupMemberService,
    private readonly groupMessageService: GroupMessageService,
    @InjectRepository(GroupChatEntity)
    private readonly groupChatRepository: Repository<GroupChatEntity>,
  ) {}

  public async handleGroupMessage(
    @MessageBody() message: GroupMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<GroupMessageDto | null> {
    this.logger.verbose(
      `### handleGroupMessage by [${socket.request.user.id}] | [${socket.id}]`,
    );

    try {
      const blockedPlayersSockets: string[] =
        await this.blockService.getBlockedByPlayersSockets(socket);

      const groupMessage: GroupMessageDto = await this.saveGroupMessage(
        socket,
        message,
      );

      if (groupMessage.groupChat.id) {
        socket
          .to(`${groupMessage.groupChat.id}`)
          .except(blockedPlayersSockets)
          .emit(socketEvent.RECEIVE_GROUP_MESSAGE, groupMessage);
      }

      return groupMessage;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.debug(
          `Unauthorized group message from sender [${message.sender.id}]`,
        );
      } else {
        this.logger.error(error);
      }
      return null;
    }
  }

  public async saveGroupMessage(
    socket: AuthenticatedSocket,
    groupMessageDto: GroupMessageDto,
  ): Promise<GroupMessageDto> {
    const user: Oauth2UserDto = socket.request.user as Oauth2UserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);
    const groupChat: GroupChatEntity = await this.getGroupChatById(
      groupMessageDto.groupChat.id,
    );

    if (
      await this.groupMemberService.isMutedGroupMember(groupChat.id, user.id)
    ) {
      this.logger.error(
        `### Cant sent message: user [${user.id}] is not a member or is muted in group chat [${groupChat.id}]`,
      );
      throw new UnauthorizedException(
        `Only non muted members of group chat can send messages`,
      );
    }
    const groupMessageEntityDb: GroupMessageEntity =
      await this.groupMessageService.save(groupChat, groupMessageDto, profile);

    this.logger.verbose(
      `### Saving group message by: [${profile.nickname}] to group [${groupChat.name}]`,
    );

    return {
      id: groupMessageEntityDb.id,
      message: groupMessageEntityDb.message,
      createdAt: groupMessageEntityDb.createdAt,
      sender: {
        id: groupMessageEntityDb.sender.id,
        nickname: groupMessageEntityDb.sender.nickname,
        avatarId: groupMessageEntityDb.sender.avatarId,
      } as MessageProfileDto,
      groupChat: {
        id: groupMessageEntityDb.groupChat.id,
        name: groupMessageEntityDb.groupChat.name,
      } as MessageGroupChatDto,
    } as GroupMessageDto;
  }

  public async getMessageHistory(
    userId: number,
  ): Promise<GroupChatHistoryDto[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const blockedUsers: SimpleProfileDto[] = await this.blockService.getBlocks(
      userId,
    );

    this.logger.verbose(`### Getting group chats for user: [${userId}]`);
    const groupMemberships: GroupMemberEntity[] =
      await this.groupMemberService.getGroupMemberships(profile);

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
        members: this.createGroupProfileDto(groupChat.members),
        bannedMembers: this.createGroupProfileDto(
          groupChat.members.filter(
            (member: GroupMemberEntity): boolean => member.isBanned,
          ),
        ),
        messages: groupChat.messages
          .map((message: GroupMessageEntity): MessageConversationDto => {
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
          .filter((message: MessageConversationDto): boolean => {
            return !blockedUsers.some(
              (blocked: SimpleProfileDto): boolean =>
                blocked.id === message.sender.id,
            );
          })
          .sort((a: MessageConversationDto, b: MessageConversationDto) => {
            return a.createdAt.getTime() - b.createdAt.getTime();
          }),
      } as GroupChatHistoryDto;
    });
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

  public async create(
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

      await this.groupMemberService.addGroupChatMember(
        groupChatEntity,
        profile,
        chatRole,
      );

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

  public async deleteById(id: number): Promise<GroupChatDeletedResponseDto> {
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

  public async join(
    chatId: number,
    userId: number,
    requestPassword: Partial<GroupChatPasswordDto>,
  ): Promise<GroupMemberDto> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    if (await this.groupMemberService.isGroupMember(groupChat.id, profile.id)) {
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

    return await this.groupMemberService.addGroupChatMember(
      groupChat,
      profile,
      chatRole,
    );
  }

  public async leave(
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

    return await this.groupMemberService.removeMember(groupChat, profile);
  }

  public async getGroupChatDtoById(id: number): Promise<GroupChatDto> {
    const groupChat: GroupChatEntity = await this.getGroupChatById(id);

    return this.createGroupChatDto(groupChat, groupChat.owner);
  }

  public async addMember(
    chatId: number,
    profileId: number,
    chatRole: ChatRole,
  ): Promise<GroupMemberDto> {
    const profile: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    return await this.groupMemberService.addGroupChatMember(
      groupChat,
      profile,
      chatRole,
    );
  }

  public async changePassword(
    chatId: number,
    password: GroupChatPasswordDto,
  ): Promise<GroupChatUpdatedResponseDto> {
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

  public async deletePassword(
    chatId: number,
  ): Promise<GroupChatUpdatedResponseDto> {
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

  public async getPlayerGroupChatNames(
    socket: AuthenticatedSocket,
  ): Promise<string[]> {
    const rooms: string[] = await this.getMessageHistory(
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

  public async saveHttpMessage(
    chatId: number,
    userId: number,
    message: MessageHttpDto,
  ): Promise<GroupMessageDto> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    if (
      !groupChat.members.find(
        (m: GroupMemberEntity): boolean => m.profile.id === profile.id,
      )
    ) {
      throw new UnauthorizedException(
        `Only members of group chat can send messages`,
      );
    }

    const groupMessageEntityDb: GroupMessageEntity =
      await this.groupMessageService.save(
        groupChat,
        {
          message: message.message,
        } as GroupMessageDto,
        profile,
      );

    return {
      id: groupMessageEntityDb.id,
      message: groupMessageEntityDb.message,
      createdAt: groupMessageEntityDb.createdAt,
      sender: {
        id: groupMessageEntityDb.sender.id,
        nickname: groupMessageEntityDb.sender.nickname,
        avatarId: groupMessageEntityDb.sender.avatarId,
      },
      groupChat: {
        id: groupMessageEntityDb.groupChat.id,
        name: groupMessageEntityDb.groupChat.name,
      },
    } as GroupMessageDto;
  }

  private async isGroupNameExist(name: string): Promise<boolean> {
    const groupChatEntity: GroupChatEntity | null =
      await this.groupChatRepository.findOneBy({
        name,
      });

    return !!groupChatEntity;
  }

  private createGroupProfileDto(
    memberEntity: GroupMemberEntity[],
  ): GroupProfileDto[] {
    return memberEntity.map((member: GroupMemberEntity): GroupProfileDto => {
      return {
        profile: {
          id: member.profile.id,
          nickname: member.profile.nickname,
          avatarId: member.profile.avatarId,
        },
        role: member.role,
        isMuted: member.isMuted,
        isBanned: member.isBanned,
      } as GroupProfileDto;
    });
  }

  private createGroupChatDto(
    groupChatEntity: GroupChatEntity,
    profile: ProfileEntity,
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
}
