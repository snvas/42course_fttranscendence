import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChatEntity, GroupMessageEntity } from '../../db/entities';
import { Repository } from 'typeorm';
import { GroupMessageDto } from '../models/group/group-message.dto';
import { ProfileDTO } from '../../profile/models/profile.dto';

@Injectable()
export class GroupMessageService {
  private readonly logger: Logger = new Logger(GroupMessageService.name);

  constructor(
    @InjectRepository(GroupMessageEntity)
    private readonly groupMessageRepository: Repository<GroupMessageEntity>,
  ) {}

  public async save(
    groupChat: GroupChatEntity,
    groupMessageDto: GroupMessageDto,
    profile: ProfileDTO,
  ): Promise<GroupMessageEntity> {
    const groupMessageEntity: GroupMessageEntity =
      this.groupMessageRepository.create({
        groupChat,
        message: groupMessageDto.message,
        sender: profile,
      });

    return await this.groupMessageRepository.save(groupMessageEntity);
  }
}
