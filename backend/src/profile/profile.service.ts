import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ProfileEntity, UserEntity } from '../db/entities';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeleteResult,
  QueryFailedError,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Profile } from './interfaces/profile.interface';
import { ProfileDeletedResponseDto } from './models/profile-delete-response.dto';
import { ProfileUpdatedResponseDto } from './models/profile-updated-response.dto';
import { AvatarService } from '../avatar/avatar.service';
import { plainToClass } from 'class-transformer';
import { ProfileDTO } from './models/profile.dto';
import { AvatarDTO } from '../avatar/models/avatar.dto';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';

@Injectable()
export class ProfileService {
  private readonly logger: Logger = new Logger(ProfileService.name);

  /**
   * Constructs a new instance of the ProfileService class.
   * @param userService - The UserService instance.
   * @param avatarService - The AvatarService instance.
   * @param profileRepository - The ProfileEntity repository.
   * @param dataSource - The DataSource instance.
   */
  constructor(
    private readonly userService: UserService,
    private readonly avatarService: AvatarService,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private dataSource: DataSource,
  ) {}

  /**
   * Finds a profile by user ID.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to a ProfileDTO object.
   * @throws NotFoundException if the user is not found.
   */
  async findByUserId(userId: number): Promise<ProfileDTO> {
    const profileEntity: ProfileEntity | null =
      await this.profileRepository.findOne({
        where: {
          userEntity: { id: userId },
        },
        relations: {
          groupMemberships: {
            groupChat: true,
          },
          ownedGroupChats: true,
        },
      });

    if (!profileEntity) {
      throw new NotFoundException(`User [${userId}] not found`);
    }

    this.logger.log(`Profile found for user [${userId}]`);

    return this.createProfileDto(profileEntity);
  }

  /**
   * Finds a profile by profile ID.
   * @param profileId - The ID of the profile to find.
   * @returns A Promise that resolves to a ProfileDTO object representing the found profile.
   * @throws NotFoundException if the profile with the given ID is not found.
   */
  async findByProfileId(profileId: number): Promise<ProfileDTO> {
    const profileEntity: ProfileEntity | null =
      await this.profileRepository.findOne({
        where: {
          id: profileId,
        },
        relations: {
          groupMemberships: {
            groupChat: true,
          },
        },
      });

    if (!profileEntity) {
      throw new NotFoundException(
        `Public profile for profileId [${profileId}] not found`,
      );
    }

    this.logger.log(`Public profile found for user [${profileId}]`);
    return this.createProfileDto(profileEntity);
  }

  /**
   * Retrieves all profiles.
   * @returns A promise that resolves to an array of ProfileDTO objects.
   * @throws NotFoundException if group chats are not found.
   */
  async findAllProfiles(): Promise<ProfileDTO[]> {
    const profileEntity: ProfileEntity[] | null =
      await this.profileRepository.find({
        relations: {
          groupMemberships: {
            groupChat: true,
          },
          ownedGroupChats: true,
        },
      });

    if (!profileEntity) {
      throw new NotFoundException(`Group chats not found`);
    }

    return profileEntity.map((profile: ProfileEntity) =>
      this.createProfileDto(profile),
    );
  }

  /**
   * Checks if a nickname already exists in the profile repository.
   * @param nickname - The nickname to check.
   * @returns A promise that resolves to a boolean indicating if the nickname exists.
   */
  async isNicknameExist(nickname: string): Promise<boolean> {
    const profileEntity: ProfileEntity | null =
      await this.profileRepository.findOneBy({
        nickname,
      });

    return !!profileEntity;
  }

  /**
   * Creates a profile for a user.
   * @param userId - The ID of the user.
   * @param nickname - The nickname for the profile.
   * @returns A Promise that resolves to a ProfileDTO object representing the created profile.
   * @throws NotFoundException if the user with the given ID is not found.
   * @throws BadRequestException if the user already has a profile or if the nickname already exists.
   * @throws NotAcceptableException if the nickname already exists.
   */
  async create(userId: number, nickname: string): Promise<ProfileDTO> {
    const userEntity: UserEntity | null = await this.userService.findById(
      userId,
    );

    if (!userEntity) {
      throw new NotFoundException(`User [${userId}] not found`);
    }

    const profileEntity: ProfileEntity = this.profileRepository.create({
      nickname,
      userEntity,
    });

    let savedEntity: ProfileEntity;

    try {
      savedEntity = await this.profileRepository.save(profileEntity);
    } catch (Exception) {
      if (Exception instanceof QueryFailedError) {
        if (await this.userHasProfile(userEntity)) {
          this.logger.error(`Profile already exists for user [${userId}]`);
          throw new BadRequestException(
            `User [${userId}] already has a profile`,
          );
        }

        this.logger.error(
          `User [${userId}] chose a nickname ${nickname} already exists`,
        );
        throw new NotAcceptableException(
          `Nickname: ${nickname} already exists`,
        );
      }
      throw Exception;
    }

    this.logger.log(`Profile created for user [${userId}]`);
    return plainToClass(ProfileDTO, savedEntity);
  }

  /**
   * Updates the profile of a user.
   *
   * @param userId - The ID of the user.
   * @param profile - The partial profile object containing the fields to update.
   * @returns A promise that resolves to a ProfileUpdatedResponseDto object.
   * @throws NotFoundException if the user is not found.
   * @throws NotAcceptableException if the chosen nickname already exists.
   */
  async update(
    userId: number,
    profile: Partial<Profile>,
  ): Promise<ProfileUpdatedResponseDto> {
    await this.findByUserId(userId);

    try {
      const updateResult: UpdateResult = await this.profileRepository.update(
        { userEntity: { id: userId } },
        profile,
      );

      this.logger.log(`Profile updated for user [${userId}]`);

      if (!updateResult.affected) {
        this.logger.error(`### User [${userId}] not found, nothing to update`);
        throw new NotFoundException(`User [${userId}] not found`);
      }

      return {
        updated: updateResult.affected > 0,
        affected: updateResult.affected,
      };
    } catch (Exception) {
      if (
        Exception instanceof QueryFailedError &&
        profile.nickname != null &&
        (await this.isNicknameExist(profile.nickname))
      ) {
        this.logger.error(
          `User [${userId}] chose a nickname ${profile.nickname} already exists`,
        );
        throw new NotAcceptableException(
          `Nickname: ${profile.nickname} already exists`,
        );
      }
      throw Exception;
    }
  }

  /**
   * Deletes a user profile.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to a ProfileDeletedResponseDto object.
   * @throws NotFoundException if the user or avatar is not found.
   */
  async delete(userId: number): Promise<ProfileDeletedResponseDto> {
    const profileDto: ProfileDTO = await this.findByUserId(userId);

    const userDeleteResult: DeleteResult = await this.userService.delete(
      userId,
    );

    if (!userDeleteResult.affected) {
      this.logger.error(`### User [${userId}] not found, nothing to delete`);
      throw new NotFoundException(`User [${userId}] not found`);
    }

    this.logger.log(`### User [${userId}] and profile deleted`);

    if (!profileDto.avatarId) {
      return {
        deleted: userDeleteResult.affected > 0,
        affected: userDeleteResult.affected,
      };
    }

    const avatarDeleteResult: DeleteResult = await this.avatarService.delete(
      profileDto.avatarId,
    );

    if (!avatarDeleteResult.affected) {
      this.logger.error(
        `### Avatar [${profileDto.avatarId}] not found, nothing to delete`,
      );
      throw new NotFoundException(`Avatar [${profileDto.avatarId}] not found`);
    }

    this.logger.log(`### User [${userId}] avatar deleted`);

    return {
      deleted: avatarDeleteResult.affected > 0,
      affected: userDeleteResult.affected,
    };
  }

  /**
   * Finds profiles by user IDs.
   * @param userIds - An array of user IDs.
   * @returns A promise that resolves to an array of ProfileEntity objects.
   */
  async findByUserIds(userIds: number[]): Promise<ProfileEntity[]> {
    return await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.userEntity', 'user')
      .andWhere('user.id IN (:...userIds)', { userIds })
      .getMany();
  }

  /**
   * Uploads an avatar for a user.
   *
   * @param userId - The ID of the user.
   * @param imageBuffer - The buffer containing the image data.
   * @param filename - The name of the image file.
   * @returns A promise that resolves to an AvatarDTO object representing the uploaded avatar.
   */
  async uploadAvatar(
    userId: number,
    imageBuffer: Buffer,
    filename: string,
  ): Promise<AvatarDTO> {
    this.logger.verbose(`Updating avatar for user [${userId}]`);

    let avatarDTO: AvatarDTO | null = null;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const profileEntity: ProfileEntity | null =
        await queryRunner.manager.findOneBy(ProfileEntity, {
          userEntity: { id: userId },
        });

      avatarDTO = await this.avatarService.uploadWithQueryRunner(
        imageBuffer,
        filename,
        queryRunner,
      );

      await queryRunner.manager.update(
        ProfileEntity,
        { userEntity: { id: userId } },
        { avatarId: avatarDTO.id },
      );

      if (profileEntity?.avatarId) {
        await this.avatarService.deleteWithQueryRunner(
          profileEntity.avatarId,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return avatarDTO;
  }

  /**
   * Checks if a user has a profile.
   * @param user - The user object.
   * @returns A promise that resolves to a boolean indicating whether the user has a profile or not.
   */
  public async userHasProfile(user: FortyTwoUserDto): Promise<boolean> {
    try {
      const profileDTO: ProfileDTO = await this.findByUserId(user.id);

      if (profileDTO) {
        return true;
      }
    } catch (e) {
      if (!(e instanceof NotFoundException)) {
        throw e;
      }
    }
    return false;
  }

  /**
   * Calculates the level and percentage based on the given score.
   * @param score - The score to calculate the level and percentage for.
   * @returns An object containing the level and percentage.
   */
  public calculateLevel(score: number): { level: number; percentage: number } {
    let previousLevelScore = 0;
    let nextLevelScore = 120;
    let level = 1;

    while (score >= nextLevelScore) {
      level++;

      previousLevelScore = nextLevelScore;
      nextLevelScore += Math.round(nextLevelScore / 2);
    }

    const percentage: number = parseFloat(
      (
        ((score - previousLevelScore) / (nextLevelScore - previousLevelScore)) *
        100
      ).toFixed(2),
    );

    return { level, percentage };
  }

  /**
   * Creates a profile DTO from a profile entity.
   * @param profileEntity The profile entity to create the DTO from.
   * @returns The created profile DTO.
   */
  private createProfileDto(profileEntity: ProfileEntity) {
    const profileDto: ProfileDTO = plainToClass(ProfileDTO, profileEntity);

    const calculatedLevel: { level: number; percentage: number } =
      this.calculateLevel(profileEntity.level);

    profileDto.level = calculatedLevel.level;
    profileDto.level_percentage = calculatedLevel.percentage;
    return profileDto;
  }
}
