import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket';
import { GroupMessageDto } from './dto/group-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  GroupChatEntity,
  GroupMemberEntity,
  GroupMessageEntity,
  PrivateMessageEntity,
  ProfileEntity,
} from '../db/entities';
import { plainToClass } from 'class-transformer';
import { ProfileService } from '../profile/profile.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { ProfileDTO } from '../profile/models/profile.dto';
import { GroupCreationDto } from './dto/group-creation.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GroupRoleDto } from './dto/group-role.dto';
import { hashPassword } from '../utils/bcrypt';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);
  private authenticatedSockets: Map<number, AuthenticatedSocket> = new Map();

  constructor(
    private readonly profileService: ProfileService,
    @InjectRepository(GroupMessageEntity)
    private readonly chatMessageRepository: Repository<GroupMessageEntity>,
    @InjectRepository(GroupChatEntity)
    private readonly groupChatRepository: Repository<GroupChatEntity>,
    @InjectRepository(GroupMessageEntity)
    private readonly groupMessageRepository: Repository<GroupMessageEntity>,
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>,
    @InjectRepository(PrivateMessageEntity)
    private readonly privateMessageRepository: Repository<PrivateMessageEntity>,
  ) {}

  public setOnlineUser(socket: AuthenticatedSocket): void {
    this.authenticatedSockets.set(socket.request.user.id, socket);
  }

  public removeOnlineUser(socket: AuthenticatedSocket): void {
    this.authenticatedSockets.delete(socket.request.user.id);
  }

  public async getOnlineUsers(): Promise<string[]> {
    const authenticatedSockets: AuthenticatedSocket[] = Array.from(
      this.authenticatedSockets.values(),
    );

    const usersFromSockets: number[] = authenticatedSockets.map(
      (user: AuthenticatedSocket) => user.request.user.id,
    );

    if (usersFromSockets.length === 0) {
      return [];
    }

    const onlineProfiles: ProfileEntity[] =
      await this.profileService.findByUserIds(usersFromSockets);

    const onlineNicknames: string[] = onlineProfiles.map(
      (p: ProfileEntity) => p.nickname,
    );

    this.logger.debug(`### Online users nicknames: ${onlineNicknames}`);

    return onlineNicknames;
  }

  //TODO: Implement
  public async handleGroupMessage(
    socket: AuthenticatedSocket,
    message: string,
  ): Promise<GroupMessageDto> {
    const user: FortyTwoUserDto = socket.request.user as FortyTwoUserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);

    const messageEntity: GroupMessageEntity = this.chatMessageRepository.create(
      {
        message,
      },
    );

    const groupMessageEntity: GroupMessageEntity =
      await this.chatMessageRepository.save(messageEntity);

    this.logger.verbose(
      `### Event message: ${JSON.stringify(groupMessageEntity)}`,
    );

    return plainToClass(GroupMessageDto, groupMessageEntity);
  }

  //TODO: Implement
  //async handlePrivateMessage() {}

  async createGroupChat(
    groupCreationDto: GroupCreationDto,
    userId: number,
  ): Promise<GroupChatEntity> {
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

      const roleDto: GroupRoleDto = {
        role: 'admin',
      };

      await this.addMemberToGroupChat(groupChatEntity.id, profile.id, roleDto);

      this.logger.debug(
        `### Group chat created with name: ${groupChatEntity.name}, visibility: ${groupChatEntity.visibility} - by ${profile.nickname}`,
      );
      return groupChatEntity;
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

  async addMemberToGroupChat(
    chatId: number,
    profileId: number,
    roleDto?: GroupRoleDto,
  ): Promise<GroupMemberEntity> {
    const profile: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    const groupMember: GroupMemberEntity = this.groupMemberRepository.create({
      groupChat,
      profile,
      role: roleDto?.role || 'user',
    });
    groupMember.groupChat = groupChat;
    groupMember.profile = profile;

    this.logger.debug(
      `### Profile: ${profile.nickname} with role: ${groupMember.role} added to group chat: ${groupChat.name}`,
    );
    return await this.groupMemberRepository.save(groupMember);
  }

  async saveGroupMessage(
    chatId: number,
    userId: number,
    message: ChatMessageDto,
  ): Promise<GroupMessageEntity> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    const groupMessageEntity: GroupMessageEntity =
      this.groupMessageRepository.create({
        message: message.message,
        groupChat,
        sender: profile,
      });

    this.logger.verbose(
      `### Saving group message by: ${profile.nickname} to group ${groupChat.name}}`,
    );

    return await this.groupMessageRepository.save(groupMessageEntity);
  }

  async savePrivateMessage(
    senderUserId: number,
    receiverProfileId: number,
    message: ChatMessageDto,
  ): Promise<PrivateMessageEntity> {
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

    return await this.privateMessageRepository.save(privateMessageEntity);
  }

  public async getGroupMessages(chatId: number): Promise<GroupMessageEntity[]> {
    this.logger.verbose(`### Getting group messages for chat: ${chatId}`);

    return await this.groupMessageRepository.find({
      relations: {
        groupChat: true,
      },
      where: {
        groupChat: {
          id: chatId,
        },
      },
      order: { createdAt: 'ASC' },
      take: 500,
    });
  }

  public async getUserPrivateMessages(
    userId: number,
    withProfileId: number,
  ): Promise<PrivateMessageEntity[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    this.logger.verbose(`### Getting private messages for user: [${userId}]`);

    return await this.privateMessageRepository.find({
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
      take: 200,
    });
  }

  public async getUserGroupChats(userId: number): Promise<GroupChatEntity[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    this.logger.verbose(`### Getting group chats for user: [${userId}]`);

    const groupMemberships: GroupMemberEntity[] =
      await this.groupMemberRepository.find({
        relations: {
          groupChat: true,
        },
        where: {
          profile: {
            id: profile.id,
          },
        },
      });

    return groupMemberships.map((membership: GroupMemberEntity) => {
      return {
        ...membership.groupChat,
        password: undefined,
      };
    });
  }

  public async getUserPrivateMessagesProfiles(
    userId: number,
  ): Promise<ProfileEntity[]> {
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

    return profilesWithConversations.filter(
      (p: ProfileEntity, index: number): boolean => {
        return (
          index ===
          profilesWithConversations.findIndex(
            (o: ProfileEntity): boolean => p.nickname === o.nickname,
          )
        );
      },
    );
  }

  public async getGroupChatById(id: number): Promise<GroupChatEntity> {
    this.logger.verbose(`### Getting group chat by id: ${id}`);

    const groupChat: GroupChatEntity | null =
      await this.groupChatRepository.findOne({
        where: {
          id,
        },
      });

    if (!groupChat) {
      throw new NotFoundException(`Group chat with id ${id} not found`);
    }

    return groupChat;
  }

  private async isGroupNameExist(name: string): Promise<boolean> {
    const groupChatEntity: GroupChatEntity | null =
      await this.groupChatRepository.findOneBy({
        name,
      });

    return !!groupChatEntity;
  }
}
