import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { BlockEntity } from '../../db/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, QueryFailedError, Repository } from 'typeorm';
import { ProfileService } from '../../profile/profile.service';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { SimpleProfile } from '../../profile/interfaces/simples-profile.interface';
import { SimpleProfileDto } from '../../profile/models/simple-profile.dto';
import { ProfileDeletedResponseDto } from '../../profile/models/profile-delete-response.dto';
import { AuthenticatedSocket } from '../../chat/types/authenticated-socket.type';
import { PlayerStatusDto } from '../../profile/models/player-status.dto';
import { PlayerStatusService } from './player-status.service';

@Injectable()
export class BlockService {
  private readonly logger: Logger = new Logger(BlockService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly playerStatusService: PlayerStatusService,
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
  ) {}

  public async addBlock(
    userId: number,
    profileId: number,
  ): Promise<SimpleProfileDto> {
    const blockProfile: ProfileDTO | null =
      await this.profileService.findByProfileId(profileId);

    if (blockProfile.id === userId) {
      throw new NotFoundException(`You cannot block yourself`);
    }

    const userProfile: ProfileDTO | null =
      await this.profileService.findByUserId(userId);

    const blockEntity: BlockEntity = this.blockRepository.create({
      profile: userProfile,
      blockedUser: blockProfile,
    });

    try {
      const blockUsersDb: BlockEntity = await this.blockRepository.save(
        blockEntity,
      );

      const blockedUser: SimpleProfileDto = {
        id: blockUsersDb.blockedUser.id,
        nickname: blockUsersDb.blockedUser.nickname,
        avatarId: blockUsersDb.blockedUser.avatarId,
      } as SimpleProfileDto;

      return blockedUser;
    } catch (Error) {
      if (Error instanceof QueryFailedError) {
        this.logger.error(Error.message);
        throw new NotAcceptableException(
          `Block between ${userProfile.nickname} and ${blockProfile.nickname} already exists`,
        );
      }
      throw Error;
    }
  }

  public async getBlocks(userId: number): Promise<SimpleProfileDto[]> {
    const blocks: BlockEntity[] = await this.blockRepository.find({
      where: {
        profile: { userEntity: { id: userId } },
      },
      relations: {
        blockedUser: true,
      },
    });

    return blocks.map((block: BlockEntity): SimpleProfileDto => {
      return {
        id: block.blockedUser.id,
        nickname: block.blockedUser.nickname,
        avatarId: block.blockedUser.avatarId,
      } as SimpleProfile;
    });
  }

  public async isUserBlocked(profileId: number, anotherProfileId: number) {
    const block: BlockEntity | null = await this.blockRepository.findOne({
      where: {
        profile: { id: profileId },
        blockedUser: { id: anotherProfileId },
      },
    });

    return !!block;
  }

  public async getBlockedBy(userId: number): Promise<SimpleProfileDto[]> {
    const blocks: BlockEntity[] = await this.blockRepository.find({
      where: {
        blockedUser: { userEntity: { id: userId } },
      },
      relations: {
        blockedUser: true,
        profile: true,
      },
    });

    return blocks.map((block: BlockEntity): SimpleProfileDto => {
      return {
        id: block.profile.id,
        nickname: block.profile.nickname,
        avatarId: block.profile.avatarId,
      } as SimpleProfile;
    });
  }

  public async deleteBlock(
    userId: number,
    profileId: number,
  ): Promise<ProfileDeletedResponseDto> {
    const blockProfile: ProfileDTO | null =
      await this.profileService.findByProfileId(profileId);

    const userProfile: ProfileDTO | null =
      await this.profileService.findByUserId(userId);

    const blockedUser: BlockEntity | null = await this.blockRepository.findOne({
      where: {
        profile: { id: userProfile.id },
        blockedUser: { id: blockProfile.id },
      },
    });

    if (!blockedUser) {
      throw new NotFoundException(
        `Block between ${userProfile.nickname} and ${blockProfile.nickname} not found`,
      );
    }

    const deleteResult: DeleteResult = await this.blockRepository.delete(
      blockedUser.id,
    );

    if (!deleteResult.affected) {
      throw new InternalServerErrorException(
        `Block between ${userProfile.nickname} and ${blockProfile.nickname} not deleted`,
      );
    }

    return {
      deleted: deleteResult.affected > 0,
      affected: deleteResult.affected,
    };
  }

  public async getBlockedByPlayersSockets(
    socket: AuthenticatedSocket,
  ): Promise<string[]> {
    const blockedUsers: SimpleProfileDto[] = await this.getBlockedBy(
      socket.request.user.id,
    );

    const players: PlayerStatusDto[] =
      await this.playerStatusService.getFrontEndStatus();

    const blockedPlayersSockets: string[] = (
      await Promise.all(
        players.map(
          async (
            player: PlayerStatusDto,
          ): Promise<AuthenticatedSocket | undefined> => {
            const socket: AuthenticatedSocket | undefined =
              await this.playerStatusService.getSocket(player.id);
            if (
              socket !== undefined &&
              blockedUsers.some(
                (blocked: SimpleProfileDto): boolean =>
                  blocked.id === player.id,
              )
            ) {
              return socket;
            }
            return undefined;
          },
        ),
      )
    )
      .filter(
        (socket: AuthenticatedSocket | undefined): boolean =>
          socket !== undefined,
      )
      .map((socket: AuthenticatedSocket) => socket.id as string);

    this.logger.verbose(
      `### Blocked players sockets: [${blockedPlayersSockets}]`,
    );

    return blockedPlayersSockets;
  }
}
