import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { FriendEntity } from '../../db/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, QueryFailedError, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { ProfileService } from '../profile.service';
import { ProfileDTO } from '../models/profile.dto';
import { ProfileFriend } from '../interfaces/profile-friend.interface';
import { ProfileFriendDto } from '../models/profile-friend.dto';
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
  ): Promise<ProfileDTO> {
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

      return plainToClass(ProfileDTO, userFriendDb.friend);
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

  public async getFriends(userId: number): Promise<ProfileFriendDto[]> {
    const friends: FriendEntity[] = await this.friendRepository.find({
      where: {
        profile: { userEntity: { id: userId } },
      },
      relations: {
        friend: true,
      },
    });

    return friends.map((friend: FriendEntity): ProfileFriendDto => {
      return {
        id: friend.friend.id,
        nickname: friend.friend.nickname,
        avatarId: friend.friend.avatarId,
      } as ProfileFriend;
    });
  }

  public async getFriendBy(userId: number): Promise<ProfileFriendDto[]> {
    const friends: FriendEntity[] = await this.friendRepository.find({
      where: {
        friend: { userEntity: { id: userId } },
      },
      relations: {
        friend: true,
      },
    });

    return friends.map((friend: FriendEntity): ProfileFriendDto => {
      return {
        id: friend.friend.id,
        nickname: friend.friend.nickname,
        avatarId: friend.friend.avatarId,
      } as ProfileFriend;
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
      throw new NotFoundException(
        `Friendship between ${userProfile.nickname} and ${friendProfile.nickname} not found`,
      );
    }

    return {
      deleted: deleteResult.affected > 0,
      affected: deleteResult.affected,
    };
  }
}
