import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GroupChatEntity,
  GroupMemberEntity,
  ProfileEntity,
} from '../../db/entities';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { ChatRole } from '../types/chat-role.type';
import { GroupMemberDto } from '../models/group/group-member.dto';
import { MessageProfileDto } from '../models/message/message-profile.dto';
import { GroupChatDto } from '../models/group/group-chat.dto';
import { StatusService } from '../../status/status.service';
import { GroupMemberDeletedResponse } from '../interfaces/group/group-member-deleted-response.interface';
import { GroupMemberUpdatedResponseDto } from '../models/group/group-member-updated-response.dto';
import { GroupMemberRoleUpdateDto } from '../models/group/group-member-role-update.dto';

@Injectable()
export class GroupMemberService {
  private readonly logger: Logger = new Logger(GroupMemberService.name);

  constructor(
    private readonly playerStatusService: StatusService,
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>,
  ) {}

  public async addGroupChatMember(
    groupChat: GroupChatEntity,
    profile: ProfileEntity,
    chatRole: ChatRole,
  ): Promise<GroupMemberDto> {
    const groupMember: GroupMemberEntity = this.groupMemberRepository.create({
      groupChat,
      profile,
      role: chatRole.role,
    });

    this.logger.debug(
      `### Adding profile: [${profile.nickname}] with role: [${groupMember.role}] to group chat: [${groupChat.name}]`,
    );
    try {
      const memberEntity: GroupMemberEntity =
        await this.groupMemberRepository.save(groupMember);

      await this.playerStatusService.addRoom(profile.id, `${groupChat.id}`);

      return this.createGroupMemberDto(memberEntity, groupChat, profile);
    } catch (Exception) {
      if (Exception instanceof QueryFailedError) {
        throw new NotAcceptableException(
          `Profile [${profile.nickname}] is already a member of group chat [${groupChat.name}]`,
        );
      }
      throw Exception;
    }
  }

  async isNotMutedGroupMember(
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

  async getGroupMemberships(profile: ProfileDTO): Promise<GroupMemberEntity[]> {
    return await this.groupMemberRepository.find({
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
  }

  public async isGroupMember(chatId: number, userId: number): Promise<boolean> {
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

  public async removeMember(
    chat: GroupChatEntity,
    profile: ProfileEntity,
  ): Promise<GroupMemberDeletedResponse & GroupMemberDto> {
    const memberToRemove: GroupMemberEntity | null =
      await this.getGroupChatMember(profile.id, chat.id);

    const memberDeleteResult: DeleteResult =
      await this.groupMemberRepository.delete({
        profile: {
          id: profile.id,
        },
        groupChat: {
          id: chat.id,
        },
      });

    if (!memberDeleteResult.affected) {
      throw new InternalServerErrorException('Member not deleted');
    }
    this.logger.log(
      `### Removing member [${profile.id}] from Group chat [${chat.id}]`,
    );

    await this.playerStatusService.removeRoom(profile.id, `${chat.id}`);

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

  public async updateRole(
    chatId: number,
    profileId: number,
    chatRole: GroupMemberRoleUpdateDto,
  ): Promise<GroupMemberDto & GroupMemberUpdatedResponseDto> {
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

    groupMember.role = chatRole.role;

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

  public async mute(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto & GroupMemberDto> {
    return await this.handleMute(profileId, chatId, true);
  }

  public async getGroupMemberRole(
    groupChat: GroupChatEntity,
    profile: ProfileEntity,
  ): Promise<ChatRole> {
    if (profile.id === groupChat.owner.id) {
      return { role: 'owner' };
    }

    const groupMember: GroupMemberEntity = await this.getGroupChatMember(
      profile.id,
      groupChat.id,
    );

    return groupMember.role === 'admin' ? { role: 'admin' } : { role: 'user' };
  }

  public async unmute(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberUpdatedResponseDto & GroupMemberDto> {
    return await this.handleMute(profileId, chatId, false);
  }

  public async ban(chatId: number, profileId: number): Promise<GroupMemberDto> {
    return await this.handleBan(profileId, chatId, true);
  }

  public async unban(
    chatId: number,
    profileId: number,
  ): Promise<GroupMemberDto> {
    return await this.handleBan(profileId, chatId, false);
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

  private async handleMute(
    profileId: number,
    chatId: number,
    mute: boolean,
  ): Promise<GroupMemberUpdatedResponseDto & GroupMemberDto> {
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
  ): Promise<GroupMemberDto> {
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
          isBanned: ban,
        },
      );

    if (!updatedMemberResult.affected) {
      this.logger.error(
        `### Member [${profileId}] not ban status not update to [${ban}]`,
      );
      throw new InternalServerErrorException('Member not banned');
    }

    this.logger.verbose(
      `### Member [${profileId}] ban status changed to [${ban}]`,
    );

    return {
      ...this.createGroupMemberDto(
        groupMember,
        groupMember.groupChat,
        groupMember.profile,
      ),
    };
  }

  private createGroupMemberDto(
    memberEntity: GroupMemberEntity,
    groupChat: GroupChatEntity,
    newMemberProfile: ProfileEntity,
  ): GroupMemberDto {
    return {
      id: memberEntity.id,
      role: memberEntity.role,
      isMuted: memberEntity.isMuted,
      isBanned: memberEntity.isBanned,
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
}
