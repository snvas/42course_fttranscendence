import { Injectable, Logger } from '@nestjs/common';
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

  async setOnlineUser(socket: AuthenticatedSocket) {
    this.authenticatedSockets.set(socket.request.user.id, socket);
  }

  removeOnlineUser(socket: AuthenticatedSocket) {
    this.authenticatedSockets.delete(socket.request.user.id);
  }

  async getOnlineUsers(): Promise<string[]> {
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

  async handleGroupMessage(
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
    name: string,
    owner: ProfileEntity,
  ): Promise<GroupChatEntity> {
    const groupChat: GroupChatEntity = this.groupChatRepository.create({
      name,
      owner,
    });

    return await this.groupChatRepository.save(groupChat);
  }

  async addMemberToGroupChat(
    groupChat: GroupChatEntity,
    profile: ProfileEntity,
  ): Promise<GroupMemberEntity> {
    const groupMember: GroupMemberEntity = this.groupMemberRepository.create({
      groupChat,
      profile,
    });
    groupMember.groupChat = groupChat;
    groupMember.profile = profile;

    return await this.groupMemberRepository.save(groupMember);
  }

  async saveGroupMessage(
    groupChat: GroupChatEntity,
    sender: ProfileEntity,
    message: string,
  ): Promise<GroupMessageEntity> {
    const groupMessageEntity: GroupMessageEntity =
      this.groupMessageRepository.create({
        message,
        groupChat,
        sender,
      });

    return await this.groupMessageRepository.save(groupMessageEntity);
  }

  async savePrivateMessage(
    sender: ProfileEntity,
    receiver: ProfileEntity,
    message: string,
  ): Promise<PrivateMessageEntity> {
    const privateMessageEntity: PrivateMessageEntity =
      this.privateMessageRepository.create({
        sender,
        receiver,
        message,
      });

    return await this.privateMessageRepository.save(privateMessageEntity);
  }

  async getGroupMessages(
    groupChat: GroupChatEntity,
  ): Promise<GroupMessageEntity[]> {
    return await this.groupMessageRepository.find({
      relations: {
        groupChat: true,
      },
      where: {
        groupChat: {
          id: groupChat.id,
        },
      },
      order: { createdAt: 'ASC' },
      take: 500,
    });
  }

  async getPrivateMessages(
    profile1: ProfileEntity,
    profile2: ProfileEntity,
  ): Promise<PrivateMessageEntity[]> {
    return await this.privateMessageRepository.find({
      where: [
        {
          sender: {
            id: profile1.id,
          },
          receiver: {
            id: profile2.id,
          },
        },
        {
          sender: {
            id: profile2.id,
          },
          receiver: {
            id: profile1.id,
          },
        },
      ],
      order: { createdAt: 'ASC' },
      take: 200,
    });
  }
}
