import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { FriendEntity } from '../../db/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, QueryFailedError, Repository } from 'typeorm';
import { ProfileService } from '../profile.service';
import { ProfileDTO } from '../models/profile.dto';
import { SimpleProfile } from '../interfaces/simples-profile.interface';
import { SimpleProfileDto } from '../models/simple-profile.dto';
import { ProfileDeletedResponseDto } from '../models/profile-delete-response.dto';

@Injectable()
export class FriendService {
  private readonly logger: Logger = new Logger(FriendService.name);

  constructor(
    private readonly profileService: ProfileService,
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
  ) {}

  public async addFriend(
    userId: number,
    profileId: number,
  ): Promise<SimpleProfileDto> {
    const friendProfile: ProfileDTO | null =
      await this.profileService.findByProfileId(profileId);

    if (friendProfile.id === userId) {
      throw new NotFoundException(`You cannot add yourself as a friend`);
    }

    const userProfile: ProfileDTO | null =
      await this.profileService.findByUserId(userId);

    const userFriend: FriendEntity = this.friendRepository.create({
      profile: userProfile,
      friend: friendProfile,
    });

    try {
      const userFriendDb: FriendEntity = await this.friendRepository.save(
        userFriend,
      );

      return {
        id: userFriendDb.friend.id,
        nickname: userFriendDb.friend.nickname,
        avatarId: userFriendDb.friend.avatarId,
      } as SimpleProfileDto;
    } catch (Error) {
      if (Error instanceof QueryFailedError) {
        this.logger.error(Error.message);
        throw new NotAcceptableException(
          `Friendship between ${userProfile.nickname} and ${friendProfile.nickname} already exists`,
        );
      }
      throw Error;
    }
  }

  public async getFriends(userId: number): Promise<SimpleProfileDto[]> {
    const friends: FriendEntity[] = await this.friendRepository.find({
      where: {
        profile: { userEntity: { id: userId } },
      },
      relations: {
        friend: true,
      },
    });

    return friends.map((friendship: FriendEntity): SimpleProfileDto => {
      return {
        id: friendship.friend.id,
        nickname: friendship.friend.nickname,
        avatarId: friendship.friend.avatarId,
      } as SimpleProfile;
    });
  }

  public async getFriendBy(userId: number): Promise<SimpleProfileDto[]> {
    const friends: FriendEntity[] = await this.friendRepository.find({
      where: {
        friend: { userEntity: { id: userId } },
      },
      relations: {
        friend: true,
        profile: true,
      },
    });

    return friends.map((friendship: FriendEntity): SimpleProfileDto => {
      return {
        id: friendship.profile.id,
        nickname: friendship.profile.nickname,
        avatarId: friendship.profile.avatarId,
      } as SimpleProfile;
    });
  }

  public async deleteFriend(
    userId: number,
    profileId: number,
  ): Promise<ProfileDeletedResponseDto> {
    const friendProfile: ProfileDTO | null =
      await this.profileService.findByProfileId(profileId);

    const userProfile: ProfileDTO | null =
      await this.profileService.findByUserId(userId);

    const friend: FriendEntity | null = await this.friendRepository.findOne({
      where: {
        profile: { id: userProfile.id },
        friend: { id: friendProfile.id },
      },
    });

    if (!friend) {
      throw new NotFoundException(
        `Friendship between ${userProfile.nickname} and ${friendProfile.nickname} not found`,
      );
    }

    const deleteResult: DeleteResult = await this.friendRepository.delete(
      friend.id,
    );

    if (!deleteResult.affected) {
      throw new InternalServerErrorException(
        `Friendship between ${userProfile.nickname} and ${friendProfile.nickname} not deleted`,
      );
    }

    return {
      deleted: deleteResult.affected > 0,
      affected: deleteResult.affected,
    };
  }
}
