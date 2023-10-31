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
import { ProfileService } from '../profile.service';
import { ProfileDTO } from '../models/profile.dto';
import { SimpleProfile } from '../interfaces/simples-profile.interface';
import { SimpleProfileDto } from '../models/simple-profile.dto';
import { ProfileDeletedResponseDto } from '../models/profile-delete-response.dto';

@Injectable()
export class BlockService {
  private readonly logger: Logger = new Logger(BlockService.name);

  constructor(
    private readonly profileService: ProfileService,
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

      return {
        id: blockUsersDb.blockedUser.id,
        nickname: blockUsersDb.blockedUser.nickname,
        avatarId: blockUsersDb.blockedUser.avatarId,
      } as SimpleProfileDto;
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

  public async isUserBlocked(profileId: number, receiverId: number) {
    const block: BlockEntity | null = await this.blockRepository.findOne({
      where: {
        profile: { id: profileId },
        blockedUser: { id: receiverId },
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
}
