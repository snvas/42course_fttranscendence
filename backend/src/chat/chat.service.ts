import { Injectable, Logger } from '@nestjs/common';
import { AuthenticatedSocket } from './types/authenticated-socket';
import { GroupMessageDto } from './dto/group-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMessageEntity, ProfileEntity } from '../db/entities';
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
        group_id: 1,
        sender_id: profile.id,
        sender_name: profile.nickname,
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
}
