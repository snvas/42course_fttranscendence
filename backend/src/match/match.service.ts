import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatusService } from '../status/status.service';
import { PlayerStatusDto } from '../profile/models/player-status.dto';
import { AuthenticatedSocket } from '../chat/types/authenticated-socket.type';
import { socketEvent } from '../ws/ws-events';
import { ProfileService } from '../profile/profile.service';
import { ProfileDTO } from '../profile/models/profile.dto';
import { MatchEventDto } from './models/match-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity, ProfileEntity } from '../db/entities';
import { DataSource, QueryRunner, Repository, UpdateResult } from 'typeorm';
import * as UUID from 'uuid';
import { MatchUpdatedDto } from './models/match-updated.dto';
import { MatchHistoryDto } from './models/match-history.dto';
import { BlockService } from '../social/services/block.service';
import { WsGateway } from '../ws/ws.gateway';

/**
 * MatchService class responsible for handling match-related operations.
 */
@Injectable()
export class MatchService {
  private readonly logger: Logger = new Logger(MatchService.name);

  /**
   * Creates an instance of the MatchService class.
   * @param profileService - The profile service.
   * @param status - The status service.
   * @param blockService - The block service.
   * @param wsGateway - The WebSocket gateway.
   * @param matchRepository - The match repository.
   * @param dataSource - The data source.
   */
  constructor(
    private readonly profileService: ProfileService,
    private readonly status: StatusService,
    private readonly blockService: BlockService,
    private readonly wsGateway: WsGateway,
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    private dataSource: DataSource,
  ) {}

  /**
   * Retrieves the match history for a given user.
   *
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of MatchHistoryDto objects representing the match history.
   */
  public async getMatchHistory(userId: number): Promise<MatchHistoryDto[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    /**
     * Retrieves an array of MatchEntity objects based on the provided criteria.
     *
     * @param profile - The profile object used to filter the matches.
     * @returns An array of MatchEntity objects.
     */
    const matchEntity: MatchEntity[] = await this.matchRepository.find({
      where: [
        {
          p1: {
            id: profile.id,
          },
          status: 'finished',
        },
        {
          p2: {
            id: profile.id,
          },
          status: 'finished',
        },
        {
          p1: {
            id: profile.id,
          },
          status: 'abandoned',
        },
        {
          p2: {
            id: profile.id,
          },
          status: 'abandoned',
        },
      ],
      relations: {
        p1: true,
        p2: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return matchEntity.map((match: MatchEntity): MatchHistoryDto => {
      let opponent: ProfileEntity;
      let user: ProfileEntity;
      let userScore: number;
      let opponentScore: number;
      let winner: 'me' | 'opponent';

      if (!match.winner) {
        throw new InternalServerErrorException('Match without winner');
      }

      if (match.p1.id === profile.id) {
        userScore = match.p1Score;
        user = match.p1;
        opponent = match.p2;
        opponentScore = match.p2Score;
        winner = match.winner === 'p1' ? 'me' : 'opponent';
      } else {
        userScore = match.p2Score;
        user = match.p2;
        opponent = match.p1;
        opponentScore = match.p1Score;
        winner = match.winner === 'p2' ? 'me' : 'opponent';
      }

      return {
        matchId: match.id,
        opponent: {
          id: opponent.id,
          nickname: opponent.nickname,
          avatarId: opponent.avatarId,
        },
        me: {
          id: user.id,
          nickname: user.nickname,
          avatarId: user.avatarId,
        },
        myScore: userScore,
        opponentScore: opponentScore,
        winner: winner,
        matchStatus: match.status,
      } as MatchHistoryDto;
    });
  }

  /**
   * Joins a private match between the user and an opponent.
   *
   * @param userId - The ID of the user joining the match.
   * @param opponentProfileId - The ID of the opponent's profile.
   * @returns A Promise that resolves to void.
   * @throws BadRequestException if the player is not connected or blocked.
   */
  public async joinPrivateMatch(
    userId: number,
    opponentProfileId: number,
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const opponentProfile: ProfileDTO =
      await this.profileService.findByProfileId(opponentProfileId);

    const profileSocket: AuthenticatedSocket | undefined =
      await this.status.getSocket(profile.id);
    const opponentSocket: AuthenticatedSocket | undefined =
      await this.status.getSocket(opponentProfile.id);

    if (!profileSocket || !opponentSocket) {
      throw new BadRequestException('Player not connected');
    }

    if (
      (await this.blockService.isUserBlocked(profile.id, opponentProfile.id)) ||
      (await this.blockService.isUserBlocked(opponentProfile.id, profile.id))
    ) {
      throw new BadRequestException('Player blocked');
    }

    const matchEntity: MatchEntity = await this.createPrivateMatch(
      profile,
      opponentProfile,
    );

    this.logger.debug(
      `Private Match [${matchEntity.id}] created between [${profile.id}] | [${profile.nickname}] and [${opponentProfile.id}] | [${opponentProfile.nickname}]`,
    );

    (await this.wsGateway.getServer())
      .to(profileSocket.id)
      .emit(
        socketEvent.PRIVATE_MATCH_FOUND,
        this.createMatchEvent(
          matchEntity.id,
          matchEntity.p1,
          matchEntity.p2,
          'p1',
        ),
      );

    (await this.wsGateway.getServer())
      .to(opponentSocket.id)
      .emit(
        socketEvent.PRIVATE_MATCH_FOUND,
        this.createMatchEvent(
          matchEntity.id,
          matchEntity.p1,
          matchEntity.p2,
          'p2',
        ),
      );
  }

  /**
   * Handles the match status for a user.
   *
   * @param userId - The ID of the user.
   * @param status - The match status to set for the user. Can be one of 'waitingMatch', 'online', or 'playing'.
   * @returns A Promise that resolves when the match status is handled.
   */
  public async handleUserMatchStatus(
    userId: number,
    status: 'waitingMatch' | 'online' | 'playing',
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);

    await this.handleMatchStatus(profile.id, status);
  }

  /**
   * Handles the match status for a player.
   * @param profileId - The ID of the player's profile.
   * @param status - The status to set for the player ('waitingMatch', 'online', or 'playing').
   * @throws BadRequestException if the player is not connected.
   */
  public async handleMatchStatus(
    profileId: number,
    status: 'waitingMatch' | 'online' | 'playing',
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    this.logger.verbose(
      `Player [${profile.id}] | [${profile.nickname}] set status to [${status}]`,
    );

    const socket: AuthenticatedSocket | undefined = await this.status.getSocket(
      profile.id,
    );

    if (!socket) {
      throw new BadRequestException('Player not connected');
    }

    await this.status.set(socket, status);

    this.logger.verbose(
      `Player [${profile.id}] | [${profile.nickname}] set status to [${status}]`,
    );

    if (status === 'playing' || status === 'online') {
      await this.sendPlayerStatusEvent();
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  /**
   * Performs the match-making job by pairing up waiting players and creating matches.
   * If there are less than 2 waiting players, the function returns without doing anything.
   * The function retrieves the waiting players and their profiles, and then iterates through
   * the profiles to find valid matches. For each pair of profiles, it checks if both players
   * have an active socket connection. If they do, it sets their status to 'waitingGame' and
   * checks if they have blocked each other. If they haven't blocked each other, it creates
   * a match entity and handles the match event.
   */
  async matchMakingJob(): Promise<void> {
    const waitingMatchPlayers: PlayerStatusDto[] =
      await this.getMatchPlayerByStatus('waitingMatch');

    if (waitingMatchPlayers.length < 2) {
      return;
    }

    const waitingMatchProfiles: ProfileDTO[] =
      await this.getSortedWaitingMatchProfiles(waitingMatchPlayers);

    for (let i = 0; i < waitingMatchProfiles.length; i++) {
      for (let j = i + 1; j < waitingMatchProfiles.length; j++) {
        const p1: ProfileDTO = waitingMatchProfiles[i];
        const p2: ProfileDTO = waitingMatchProfiles[j];
        const p1Socket: AuthenticatedSocket | undefined =
          await this.status.getSocket(p1.id);
        const p2Socket: AuthenticatedSocket | undefined =
          await this.status.getSocket(p2.id);

        if (p1Socket && p2Socket) {
          await this.status.set(p1Socket, 'waitingGame');
          await this.status.set(p2Socket, 'waitingGame');

          if (
            (await this.blockService.isUserBlocked(p1.id, p2.id)) ||
            (await this.blockService.isUserBlocked(p2.id, p1.id))
          ) {
            continue;
          }

          const matchEntity: MatchEntity = await this.createMatch(p1, p2);

          this.logger.debug(
            `Match [${matchEntity.id}] found between [${p1.id}] | [${p1.nickname}] and [${p2.id}] | [${p2.nickname}]`,
          );

          await this.handleMatchEvent(matchEntity, socketEvent.MATCH_FOUND);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  /**
   * Handles the timeout for waiting games.
   * If a player has been waiting for more than 10 seconds, their status is changed to "waitingMatch".
   */
  async gameWaitingTimeout(): Promise<void> {
    const waitingGamePlayers: PlayerStatusDto[] =
      await this.getMatchPlayerByStatus('waitingGame');

    for (const player of waitingGamePlayers) {
      const timeout: number = player.updatedAt.getTime() + 10000;
      const now: number = new Date().getTime();

      if (now < timeout) {
        continue;
      }

      const playerSocket: AuthenticatedSocket | undefined =
        await this.status.getSocket(player.id);

      if (!playerSocket) {
        continue;
      }

      this.logger.warn(
        `Player [${player.id}] | [${player.nickname}] timed out waiting game, setting status to waiting match`,
      );
      this.logger.verbose(`Timeout {${timeout}} now {${now}}`);

      await this.status.set(playerSocket, 'waitingMatch');
    }
  }

  /**
   * Accepts a match.
   *
   * @param matchId - The ID of the match.
   * @param as - The player accepting the match ('p1' or 'p2').
   * @param type - The type of the match ('public' or 'private'). Defaults to 'public'.
   * @returns A promise that resolves to a MatchUpdatedDto object.
   * @throws BadRequestException if the match has already started.
   * @throws InternalServerErrorException if the match join is not updated.
   */
  public async acceptMatch(
    matchId: string,
    as: 'p1' | 'p2',
    type: 'public' | 'private' = 'public',
  ): Promise<MatchUpdatedDto> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const matchEntity: MatchEntity | null = await this.getMatchTransactional(
        queryRunner,
        matchId,
      );

      if (matchEntity.p1Joined && matchEntity.p2Joined) {
        throw new BadRequestException('Match already started');
      }

      const updateResult: UpdateResult = await this.updateMatchTransactional(
        queryRunner,
        matchId,
        as === 'p1'
          ? ({ p1Joined: true } as Partial<MatchEntity>)
          : ({ p2Joined: true } as Partial<MatchEntity>),
      );

      this.logger.verbose(
        `Match [${type}] [${matchEntity.id}] accepted by [${as}]`,
      );

      if (!updateResult.affected) {
        throw new InternalServerErrorException('Match join not updated');
      }

      const matchUpdateResult: UpdateResult | null =
        await this.handleMatchStart(as, matchEntity, queryRunner, type);

      await queryRunner.commitTransaction();
      return {
        updated: updateResult.affected > 0,
        affected: updateResult.affected,
        matchStarted: matchUpdateResult !== null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Rejects a match.
   *
   * @param matchId - The ID of the match to reject.
   * @param type - The type of the match ('public' or 'private'). Defaults to 'public'.
   * @returns A Promise that resolves to a MatchUpdatedDto object containing the updated match information.
   * @throws BadRequestException if the match has already started.
   * @throws InternalServerErrorException if the match status is not updated.
   */
  public async rejectMatch(
    matchId: string,
    type: 'public' | 'private' = 'public',
  ): Promise<MatchUpdatedDto> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.logger.verbose(`Match [${matchId}] rejected`);

    try {
      const matchEntity: MatchEntity | null = await this.getMatchTransactional(
        queryRunner,
        matchId,
      );

      if (matchEntity.p1Joined && matchEntity.p2Joined) {
        throw new BadRequestException('Match already started');
      }

      await this.handleMatchEvent(
        matchEntity,
        type === 'public'
          ? socketEvent.MATCH_REJECTED
          : socketEvent.PRIVATE_MATCH_REJECTED,
      );

      const updateResult: UpdateResult = await this.updateMatchTransactional(
        queryRunner,
        matchId,
        {
          status: 'rejected',
        },
      );

      if (!updateResult.affected) {
        throw new InternalServerErrorException('Match status not updated');
      }

      await queryRunner.commitTransaction();

      return {
        updated: updateResult.affected > 0,
        affected: updateResult.affected,
        matchStarted: false,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  public async getMatchById(matchId: string): Promise<MatchEntity> {
    const matchEntity: MatchEntity | null = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: {
        p1: true,
        p2: true,
      },
    });

    if (!matchEntity) {
      throw new NotFoundException('Match not found');
    }
    return matchEntity;
  }

  /**
   * Handles the start of a match.
   *
   * @param as - The player who initiated the match ('p1' or 'p2').
   * @param matchEntity - The match entity.
   * @param queryRunner - The query runner for database operations.
   * @param type - The type of match ('public' or 'private'). Default is 'public'.
   * @returns A promise that resolves to an UpdateResult or null.
   */
  private async handleMatchStart(
    as: 'p1' | 'p2',
    matchEntity: MatchEntity,
    queryRunner: QueryRunner,
    type: 'public' | 'private' = 'public',
  ): Promise<UpdateResult | null> {
    if (
      (as === 'p1' && !matchEntity.p2Joined) ||
      (as === 'p2' && !matchEntity.p1Joined)
    ) {
      return null;
    }

    const p1Socket: AuthenticatedSocket | undefined =
      await this.status.getSocket(matchEntity.p1.id);
    const p2Socket: AuthenticatedSocket | undefined =
      await this.status.getSocket(matchEntity.p2.id);

    if (!p1Socket || !p2Socket) {
      return null;
    }

    this.logger.verbose(
      `Match [${type}] [${matchEntity.id}] started with players [${matchEntity.p1.id}] and [${matchEntity.p2.id}]`,
    );

    await this.handleMatchEvent(
      matchEntity,
      type === 'public'
        ? socketEvent.MATCH_STARTED
        : socketEvent.PRIVATE_MATCH_STARTED,
    );
    await this.handleMatchStatus(matchEntity.p1.id, 'playing');
    await this.handleMatchStatus(matchEntity.p2.id, 'playing');

    return await this.updateMatchTransactional(queryRunner, matchEntity.id, {
      status: 'started',
    });
  }

  /**
   * Retrieves the player statuses with a specific match status.
   * @param matchStatus The match status to filter by ('waitingMatch', 'waitingGame', or 'playing').
   * @returns A promise that resolves to an array of PlayerStatusDto objects.
   */
  private async getMatchPlayerByStatus(
    matchStatus: 'waitingMatch' | 'waitingGame' | 'playing',
  ): Promise<PlayerStatusDto[]> {
    const playerStatus: PlayerStatusDto[] = await this.status.getAll();

    return playerStatus.filter(
      (player: PlayerStatusDto): boolean => player.status === matchStatus,
    );
  }

  /**
   * Retrieves and sorts the profiles of waiting match players.
   *
   * @param waitingMatchPlayers - The list of waiting match players.
   * @returns A promise that resolves to an array of sorted ProfileDTO objects.
   */
  private async getSortedWaitingMatchProfiles(
    waitingMatchPlayers: PlayerStatusDto[],
  ): Promise<ProfileDTO[]> {
    const waitingMatchProfiles: ProfileDTO[] = await Promise.all(
      waitingMatchPlayers.map(
        (player: PlayerStatusDto): Promise<ProfileDTO> =>
          this.profileService.findByProfileId(player.id),
      ),
    );

    waitingMatchProfiles.sort((p1: ProfileDTO, p2: ProfileDTO): number => {
      if (p1.level && p2.level && p1.level !== p2.level) {
        return p1.level - p2.level;
      }

      if (p1.wins && p2.wins && p1.wins !== p2.wins) {
        return p1.wins - p2.wins;
      }

      return 0;
    });
    return waitingMatchProfiles;
  }

  /**
   * Sends the player status event to the frontend.
   * @returns A promise that resolves when the event is sent.
   */
  private async sendPlayerStatusEvent(): Promise<void> {
    const playersStatus: PlayerStatusDto[] =
      await this.status.getFrontEndStatus();

    (await this.wsGateway.getServer()).emit(
      socketEvent.PLAYERS_STATUS,
      playersStatus,
    );
  }

  /**
   * Handles a match event.
   *
   * @param matchEntity - The match entity.
   * @param event - The event string.
   * @returns A promise that resolves when the event is handled.
   * @throws {InternalServerErrorException} If the event is invalid.
   */
  private async handleMatchEvent(
    matchEntity: MatchEntity,
    event: string,
  ): Promise<void> {
    if (
      event != socketEvent.MATCH_STARTED &&
      event != socketEvent.MATCH_REJECTED &&
      event != socketEvent.MATCH_FOUND &&
      event != socketEvent.PRIVATE_MATCH_FOUND &&
      event != socketEvent.PRIVATE_MATCH_STARTED &&
      event != socketEvent.PRIVATE_MATCH_REJECTED
    ) {
      throw new InternalServerErrorException('Invalid event');
    }

    this.logger.verbose(`Handling match [${matchEntity.id}] event [${event}]`);

    const p1Socket: AuthenticatedSocket | undefined =
      await this.status.getSocket(matchEntity.p1.id);
    const p2Socket: AuthenticatedSocket | undefined =
      await this.status.getSocket(matchEntity.p2.id);

    if (p1Socket && p2Socket) {
      this.logger.debug(
        `Sending match [${matchEntity.id}] event [${event}] to players [${matchEntity.p1.id}] and [${matchEntity.p2.id}]`,
      );
      (await this.wsGateway.getServer())
        .to(p1Socket.id)
        .emit(
          event,
          this.createMatchEvent(
            matchEntity.id,
            matchEntity.p1,
            matchEntity.p2,
            'p1',
          ),
        );

      (await this.wsGateway.getServer())
        .to(p2Socket.id)
        .emit(
          event,
          this.createMatchEvent(
            matchEntity.id,
            matchEntity.p1,
            matchEntity.p2,
            'p2',
          ),
        );
    }
  }

  /**
   * Retrieves a match entity with the specified match ID in a transactional context.
   * @param queryRunner - The query runner for the transaction.
   * @param matchId - The ID of the match entity to retrieve.
   * @returns A promise that resolves to the retrieved match entity.
   * @throws NotFoundException if the match entity is not found.
   */
  private async getMatchTransactional(
    queryRunner: QueryRunner,
    matchId: string,
  ): Promise<MatchEntity> {
    const matchEntity: MatchEntity | null = await queryRunner.manager.findOne(
      MatchEntity,
      {
        where: { id: matchId },
        relations: {
          p1: true,
          p2: true,
        },
      },
    );

    if (!matchEntity) {
      throw new NotFoundException('Match not found');
    }
    return matchEntity;
  }

  /**
   * Updates a match transactionally.
   *
   * @param queryRunner - The query runner used for the transaction.
   * @param matchId - The ID of the match to update.
   * @param partialEntity - The partial entity containing the updated match data.
   * @returns A promise that resolves to the update result.
   */
  private async updateMatchTransactional(
    queryRunner: QueryRunner,
    matchId: string,
    partialEntity: Partial<MatchEntity>,
  ): Promise<UpdateResult> {
    return await queryRunner.manager.update(
      MatchEntity,
      { id: matchId },
      partialEntity,
    );
  }

  /**
   * Creates a new match between two profiles.
   *
   * @param p1 - The first profile.
   * @param p2 - The second profile.
   * @returns A promise that resolves to the created match entity.
   */
  private async createMatch(
    p1: ProfileDTO,
    p2: ProfileDTO,
  ): Promise<MatchEntity> {
    return await this.matchRepository.save({
      id: UUID.v4(),
      p1: p1,
      p2: p2,
    });
  }

  /**
   * Creates a private match between two profiles.
   *
   * @param profile - The profile of the first player.
   * @param opponentProfile - The profile of the second player.
   * @returns A promise that resolves to the created MatchEntity.
   */
  private async createPrivateMatch(
    profile: ProfileDTO,
    opponentProfile: ProfileDTO,
  ): Promise<MatchEntity> {
    return await this.matchRepository.save({
      id: UUID.v4(),
      p1: profile,
      p2: opponentProfile,
      p1Joined: true,
    });
  }

  /**
   * Creates a match event object.
   * @param matchId - The ID of the match.
   * @param p1Profile - The profile of player 1.
   * @param p2Profile - The profile of player 2.
   * @param as - The role of the player creating the match event ('p1' or 'p2').
   * @returns The created match event object.
   */
  private createMatchEvent(
    matchId: string,
    p1Profile: ProfileEntity,
    p2Profile: ProfileEntity,
    as: 'p1' | 'p2',
  ): MatchEventDto {
    return {
      matchId: matchId,
      as: as,
      p1: {
        id: p1Profile.id,
        nickname: p1Profile.nickname,
        avatarId: p1Profile.avatarId,
      },
      p2: {
        id: p2Profile.id,
        nickname: p2Profile.nickname,
        avatarId: p2Profile.avatarId,
      },
    } as MatchEventDto;
  }
}
