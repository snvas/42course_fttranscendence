import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket';
import { GroupMessageDto } from './dto/group-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  //async handlePrivateMessage() {}

  async createGroupChat(
    groupCreationDto: GroupCreationDto,
    userId: number,
  ): Promise<GroupChatEntity> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    const groupChat: GroupChatEntity = this.groupChatRepository.create({
      name: groupCreationDto.name,
      owner: profile,
      visibility: groupCreationDto.visibility,
      password: groupCreationDto.password, //TODO: encrypt password, remove from return
    });

    return await this.groupChatRepository.save(groupChat);
  }

  async addMemberToGroupChat(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberEntity> {
    const profile: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    const groupMember: GroupMemberEntity = this.groupMemberRepository.create({
      groupChat,
      profile,
    });
    groupMember.groupChat = groupChat;
    groupMember.profile = profile;

    return await this.groupMemberRepository.save(groupMember);
  }

  async saveGroupMessage(
    chatId: number,
    userId: number,
    message: string,
  ): Promise<GroupMessageEntity> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const groupChat: GroupChatEntity = await this.getGroupChatById(chatId);

    const groupMessageEntity: GroupMessageEntity =
      this.groupMessageRepository.create({
        message,
        groupChat,
        sender: profile,
      });

    return await this.groupMessageRepository.save(groupMessageEntity);
  }

  async savePrivateMessage(
    senderUserId: number,
    receiverProfileId: number,
    message: { content: string },
  ): Promise<PrivateMessageEntity> {
    this.logger.debug(
      `### savePrivateMessage: message ${JSON.stringify(message)}`,
    );

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
        message: message.content,
      });

    return await this.privateMessageRepository.save(privateMessageEntity);
  }

  public async getGroupMessages(chatId: number): Promise<GroupMessageEntity[]> {
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

  public async getPrivateMessages(
    userId: number,
    withProfileId: number,
  ): Promise<PrivateMessageEntity[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

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

  public async getAllGroupChats(userId: number): Promise<GroupChatEntity[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

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

    return groupMemberships.map(
      (membership: GroupMemberEntity) => membership.groupChat,
    );
  }

  public async getPrivateMessagesProfiles(
    userId: number,
  ): Promise<ProfileEntity[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

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
}
