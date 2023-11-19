import { Injectable, Logger } from '@nestjs/common';
import { PrivateMessageDto } from '../models/private/private-message.dto';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { PrivateMessageEntity, ProfileEntity } from '../../db/entities';
import { MessageProfileDto } from '../models/message/message-profile.dto';
import { ProfileService } from '../../profile/profile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivateMessageHistoryDto } from '../models/private/private-message-history.dto';
import { MessageConversationDto } from '../models/message/message-conversation.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { MessageHttpDto } from '../models/message/message-http.dto';
import { MessageConversation } from '../interfaces/message/message-conversation.interface';
import { MessageProfile } from '../interfaces/message/message-profile.interface';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { AuthenticatedSocket } from '../types/authenticated-socket.type';
import { socketEvent } from '../../ws/ws-events';
import { StatusService } from '../../status/status.service';
import { BlockService } from '../../social/services/block.service';

@Injectable()
export class PrivateChatService {
  private readonly logger: Logger = new Logger(PrivateChatService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly blockService: BlockService,
    private readonly statusService: StatusService,
    @InjectRepository(PrivateMessageEntity)
    private readonly privateMessageRepository: Repository<PrivateMessageEntity>,
  ) {}

  async handlePrivateMessage(
    @MessageBody() message: PrivateMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ): Promise<PrivateMessageDto | null> {
    try {
      if (
        await this.blockService.isUserBlocked(
          message.receiver.id,
          message.sender.id,
        )
      ) {
        this.logger.debug(
          `### User [${message.sender.nickname}] is blocked by [${message.receiver.nickname}]`,
        );
        return null;
      }

      const receiverSocket: AuthenticatedSocket | undefined =
        await this.statusService.getSocket(message.receiver.id);

      const privateMessage: PrivateMessageDto = await this.savePrivateMessage(
        message,
      );

      if (receiverSocket) {
        socket
          .to(receiverSocket?.id)
          .emit(socketEvent.RECEIVE_PRIVATE_MESSAGE, privateMessage);
      }

      return privateMessage;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async savePrivateMessage(
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

    const privateMessageDb: PrivateMessageEntity =
      await this.privateMessageRepository.save(privateMessageEntity);

    return {
      id: privateMessageDb.id,
      message: privateMessageDb.message,
      createdAt: privateMessageDb.createdAt,
      sender: {
        id: privateMessageDb.sender.id,
        nickname: privateMessageDb.sender.nickname,
        avatarId: privateMessageDb.sender.avatarId,
      } as MessageProfileDto,
      receiver: {
        id: privateMessageDb.receiver.id,
        nickname: privateMessageDb.receiver.nickname,
        avatarId: privateMessageDb.receiver.avatarId,
      } as MessageProfileDto,
    } as PrivateMessageDto;
  }

  public async getMessageHistory(
    userId: number,
  ): Promise<PrivateMessageHistoryDto[]> {
    const profiles: ProfileDTO[] = await this.getUserPrivateMessagesProfiles(
      userId,
    );

    const privateMessagesPromises: Promise<PrivateMessageHistoryDto>[] =
      profiles.map(
        async (profile: ProfileDTO): Promise<PrivateMessageHistoryDto> => {
          const messages: MessageConversationDto[] =
            await this.getUserPrivateMessages(userId, profile.id);
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

  public async saveHttpMessage(
    senderUserId: number,
    receiverProfileId: number,
    message: MessageHttpDto,
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

  private async getUserPrivateMessages(
    userId: number,
    withProfileId: number,
  ): Promise<MessageConversationDto[]> {
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

    return messages.map(
      (message: PrivateMessageEntity): MessageConversation => {
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
      },
    );
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
}
