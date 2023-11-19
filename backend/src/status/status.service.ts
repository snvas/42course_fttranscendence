import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatusSocket } from '../chat/types/player-status.socket';
import { AuthenticatedSocket } from '../chat/types/authenticated-socket.type';
import { ProfileDTO } from '../profile/models/profile.dto';
import { PlayerStatusDto } from '../profile/models/player-status.dto';
import { ProfileService } from '../profile/profile.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StatusService {
  private readonly logger: Logger = new Logger(StatusService.name);
  private playerStatusSocket: Map<number, PlayerStatusSocket> = new Map();

  constructor(private readonly profileService: ProfileService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async onlineUsersInfoJob(): Promise<void> {
    const playersStatus = this.playerStatusSocket;

    this.logger.verbose(`### Online users ${playersStatus.size}}`);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async onlineUsersInfo(): Promise<void> {
    const playersStatus = this.playerStatusSocket;
    playersStatus.forEach((playerStatus) => {
      this.logger.verbose(
        `### Online user ${playerStatus.id} | ${playerStatus.nickname} | ${playerStatus.status}`,
      );
    });
  }

  public async set(socket: AuthenticatedSocket, status: string): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    const playerStatus: PlayerStatusSocket = {
      id: profile.id,
      nickname: profile.nickname,
      avatarId: profile.avatarId,
      status,
      updatedAt: new Date(),
      socket,
    };

    this.playerStatusSocket.set(profile.id, playerStatus);
  }

  public async remove(socket: AuthenticatedSocket): Promise<void> {
    try {
      const profile: ProfileDTO = await this.profileService.findByUserId(
        socket.request.user.id,
      );

      this.playerStatusSocket.delete(profile.id);
    } catch (error) {
      this.logger.warn(
        `### Trying to disconnect a socket from a user: [${socket.request.user.id}]`,
      );
    }
  }

  public async getFrontEndStatus(): Promise<PlayerStatusDto[]> {
    const playersStatusSockets: PlayerStatusSocket[] = Array.from(
      this.playerStatusSocket.values(),
    );

    return playersStatusSockets.map(
      (playersStatus: PlayerStatusSocket): PlayerStatusDto => {
        return {
          id: playersStatus.id,
          nickname: playersStatus.nickname,
          status: playersStatus.status !== 'playing' ? 'online' : 'playing',
          avatarId: playersStatus.avatarId,
          updatedAt: playersStatus.updatedAt,
        } as PlayerStatusDto;
      },
    );
  }

  public async getAll(): Promise<PlayerStatusDto[]> {
    const playersStatusSockets: PlayerStatusSocket[] = Array.from(
      this.playerStatusSocket.values(),
    );

    return playersStatusSockets.map(
      (playersStatus: PlayerStatusSocket): PlayerStatusDto => {
        return {
          id: playersStatus.id,
          nickname: playersStatus.nickname,
          status: playersStatus.status,
          avatarId: playersStatus.avatarId,
          updatedAt: playersStatus.updatedAt,
        } as PlayerStatusDto;
      },
    );
  }

  public async getSocket(
    profileId: number,
  ): Promise<AuthenticatedSocket | undefined> {
    this.logger.verbose(`### Player [${profileId}] get socket`);
    const playerStatus: PlayerStatusSocket | undefined =
      this.playerStatusSocket.get(profileId);

    this.logger.verbose(`### Sockets: ${this.playerStatusSocket.size}`);

    if (!playerStatus) {
      return undefined;
    }

    return playerStatus.socket;
  }

  public async addRoom(profileId: number, room: string): Promise<void> {
    const socket: AuthenticatedSocket | undefined = await this.getSocket(
      profileId,
    );

    if (!socket) {
      return;
    }

    socket.join(room);

    this.logger.verbose(`### Player [${profileId}] joined room [${room}]`);
  }

  public async removeRoom(profileId: number, room: string): Promise<void> {
    const socket: AuthenticatedSocket | undefined = await this.getSocket(
      profileId,
    );

    if (!socket) {
      return;
    }

    socket.leave(room);
  }
}
