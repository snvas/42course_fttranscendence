import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayerStatusService } from '../profile/services/player-status.service';
import { MatchGateway } from './match.gateway';
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
import { BlockService } from '../profile/services/block.service';

@Injectable()
export class MatchService {
  private readonly logger: Logger = new Logger(MatchService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly playerStatusService: PlayerStatusService,
    private readonly blockService: BlockService,
    private readonly matchGateway: MatchGateway,
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    private dataSource: DataSource,
  ) {}

  public async getMatchHistory(userId: number): Promise<MatchHistoryDto[]> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
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

  public async joinPrivateMatch(
    userId: number,
    opponentProfileId: number,
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    const opponentProfile: ProfileDTO =
      await this.profileService.findByProfileId(opponentProfileId);

    const profileSocket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(profile.id);
    const opponentSocket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(opponentProfile.id);

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

    (await this.matchGateway.getServer())
      .to(opponentSocket.id)
      .emit(
        socketEvent.MATCH_FOUND,
        this.createMatchEvent(
          matchEntity.id,
          matchEntity.p1,
          matchEntity.p2,
          'p2',
        ),
      );
  }

  public async handleUserMatchStatus(
    userId: number,
    status: 'waitingMatch' | 'online' | 'playing',
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(userId);
    await this.handleMatchStatus(profile.id, status);
  }

  public async handleMatchStatus(
    profileId: number,
    status: 'waitingMatch' | 'online' | 'playing',
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByProfileId(
      profileId,
    );

    const socket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(profile.id);

    if (!socket) {
      throw new BadRequestException('Player not connected');
    }

    await this.playerStatusService.setPlayerStatus(socket, status);

    this.logger.verbose(
      `Player [${profile.id}] | [${profile.nickname}] set status to [${status}]`,
    );

    if (status === 'playing' || status === 'online') {
      await this.sendPlayerStatusEvent();
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
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
          await this.playerStatusService.getPlayerSocket(p1.id);
        const p2Socket: AuthenticatedSocket | undefined =
          await this.playerStatusService.getPlayerSocket(p2.id);

        if (p1Socket && p2Socket) {
          await this.playerStatusService.setPlayerStatus(
            p1Socket,
            'waitingGame',
          );
          await this.playerStatusService.setPlayerStatus(
            p2Socket,
            'waitingGame',
          );

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
        await this.playerStatusService.getPlayerSocket(player.id);

      if (!playerSocket) {
        continue;
      }

      this.logger.warn(
        `Player [${player.id}] | [${player.nickname}] timed out waiting game, setting status to waiting match`,
      );
      this.logger.verbose(`Timeout {${timeout}} now {${now}}`);

      await this.playerStatusService.setPlayerStatus(
        playerSocket,
        'waitingMatch',
      );
    }
  }

  public async acceptMatch(
    matchId: string,
    as: 'p1' | 'p2',
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

      this.logger.verbose(`Match [${matchEntity.id}] accepted by [${as}]`);

      if (!updateResult.affected) {
        throw new InternalServerErrorException('Match join not updated');
      }

      const matchUpdateResult: UpdateResult | null =
        await this.handleMatchStart(as, matchEntity, queryRunner);

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

  public async rejectMatch(matchId: string): Promise<MatchUpdatedDto> {
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

      await this.handleMatchEvent(matchEntity, socketEvent.MATCH_REJECTED);

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

  private async handleMatchStart(
    as: 'p1' | 'p2',
    matchEntity: MatchEntity,
    queryRunner: QueryRunner,
  ): Promise<UpdateResult | null> {
    if (
      (as === 'p1' && !matchEntity.p2Joined) ||
      (as === 'p2' && !matchEntity.p1Joined)
    ) {
      return null;
    }

    const p1Socket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(matchEntity.p1.id);
    const p2Socket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(matchEntity.p2.id);

    if (!p1Socket || !p2Socket) {
      return null;
    }

    this.logger.verbose(
      `Match [${matchEntity.id}] started with players [${matchEntity.p1.id}] and [${matchEntity.p2.id}]`,
    );

    await this.handleMatchEvent(matchEntity, socketEvent.MATCH_STARTED);
    await this.handleMatchStatus(matchEntity.p1.id, 'playing');
    await this.handleMatchStatus(matchEntity.p2.id, 'playing');

    return await this.updateMatchTransactional(queryRunner, matchEntity.id, {
      status: 'started',
    });
  }

  private async getMatchPlayerByStatus(
    matchStatus: 'waitingMatch' | 'waitingGame' | 'playing',
  ): Promise<PlayerStatusDto[]> {
    const playerStatus: PlayerStatusDto[] =
      await this.playerStatusService.getAllPlayersStatus();

    return playerStatus.filter(
      (player: PlayerStatusDto): boolean => player.status === matchStatus,
    );
  }

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

  private async sendPlayerStatusEvent(): Promise<void> {
    const playersStatus: PlayerStatusDto[] =
      await this.playerStatusService.getPlayerFrontEndStatus();

    (await this.matchGateway.getServer()).emit(
      socketEvent.PLAYERS_STATUS,
      playersStatus,
    );
  }

  private async handleMatchEvent(
    matchEntity: MatchEntity,
    event: string,
  ): Promise<void> {
    if (
      event != socketEvent.MATCH_STARTED &&
      event != socketEvent.MATCH_REJECTED &&
      event != socketEvent.MATCH_FOUND
    ) {
      throw new InternalServerErrorException('Invalid event');
    }

    const p1Socket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(matchEntity.p1.id);
    const p2Socket: AuthenticatedSocket | undefined =
      await this.playerStatusService.getPlayerSocket(matchEntity.p2.id);

    if (p1Socket && p2Socket) {
      (await this.matchGateway.getServer())
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

      (await this.matchGateway.getServer())
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
