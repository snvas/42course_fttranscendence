import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FriendEntity } from '../../db/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { ProfileService } from '../profile.service';
import { ProfileDTO } from '../models/profile.dto';
import { ProfileFriend } from '../interfaces/profile-friend.interface';
import { ProfileFriendDto } from '../models/profile-friend.dto';

@Injectable()
export class FriendService {
  private readonly logger: Logger = new Logger(FriendService.name);

  constructor(
    private readonly profileService: ProfileService,
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
  ) {}

  async addFriend(userId: number, profileId: number): Promise<ProfileDTO> {
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

    const userFriendDb: FriendEntity = await this.friendRepository.save(
      userFriend,
    );

    return plainToClass(ProfileDTO, userFriendDb.friend);
  }

  async getFriends(userId: number): Promise<ProfileFriendDto[]> {
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
}
