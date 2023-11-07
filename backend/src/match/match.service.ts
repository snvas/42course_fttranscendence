import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayerStatusService } from '../profile/services/player-status.service';
import { MatchGateway } from './match.gateway';
import { Server } from 'socket.io';
import { PlayerStatusDto } from '../chat/models/player/player-status.dto';
import { AuthenticatedSocket } from '../chat/types/authenticated-socket.type';
import { SimpleProfileDto } from '../profile/models/simple-profile.dto';
import { socketEvent } from '../ws/ws-events';
import { ProfileService } from '../profile/profile.service';
import { ProfileDTO } from '../profile/models/profile.dto';

@Injectable()
export class MatchService {
  private readonly logger: Logger = new Logger(MatchService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly playerStatusService: PlayerStatusService,
    private readonly matchGateway: MatchGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async matchMakingJob(): Promise<void> {
    const server: Server = await this.matchGateway.getServer();

    const playerStatus: PlayerStatusDto[] =
      await this.playerStatusService.getPlayersStatus();

    const waitingMatchPlayers: PlayerStatusDto[] = playerStatus.filter(
      (player: PlayerStatusDto): boolean => player.status === 'waiting_match',
    );

    if (waitingMatchPlayers.length < 2) {
      return;
    }

    const waitingMatchProfiles: ProfileDTO[] = await Promise.all(
      waitingMatchPlayers.map(
        (player: PlayerStatusDto): Promise<ProfileDTO> =>
          this.profileService.findByUserId(player.id),
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
            'waiting_game',
          );
          await this.playerStatusService.setPlayerStatus(
            p2Socket,
            'waiting_game',
          );

          server.to(p1Socket.id).emit(socketEvent.MATCH_FOUND, {
            as: 'Player1',
            with: {
              id: p2.id,
              nickname: p2.nickname,
              avatar: p2.avatarId,
            } as SimpleProfileDto,
          });

          server.to(p2Socket.id).emit(socketEvent.MATCH_FOUND, {
            as: 'Player2',
            with: {
              id: p1.id,
              nickname: p1.nickname,
              avatar: p1.avatarId,
            } as SimpleProfileDto,
          });
        }
      }
    }
  }

  // Se o frontend não enviar o evento de cancelar a procura de partida
  //  ou não criar a match para mudar o status para playing),
  //  esse job vai ser responsável por mudar o status para awaiting_match após um timeout de 15s.
  @Cron(CronExpression.EVERY_5_SECONDS)
  async gameWaitingTimeout(): Promise<void> {
    const playerStatus: PlayerStatusDto[] =
      await this.playerStatusService.getPlayersStatus();

    const waitingGamePlayers: PlayerStatusDto[] = playerStatus.filter(
      (player: PlayerStatusDto): boolean => player.status === 'waiting_game',
    );

    for (const player of waitingGamePlayers) {
      if (player.updatedAt.getTime() + 15000 < new Date().getTime()) {
        continue;
      }

      const playerSocket: AuthenticatedSocket | undefined =
        await this.playerStatusService.getPlayerSocket(player.id);

      if (!playerSocket) {
        continue;
      }

      this.logger.error(
        `Player [${player.id}] | [${player.nickname}] timed out waiting game, setting status to waiting match`,
      );

      await this.playerStatusService.setPlayerStatus(
        playerSocket,
        'waiting_match',
      );
    }
  }
}
