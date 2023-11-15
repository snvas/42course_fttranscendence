import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatusSocket } from '../chat/types/player-status.socket';
import { AuthenticatedSocket } from '../chat/types/authenticated-socket.type';
import { ProfileDTO } from '../profile/models/profile.dto';
import { PlayerStatusDto } from '../profile/models/player-status.dto';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class StatusService {
  private readonly logger: Logger = new Logger(StatusService.name);
  private playerStatusSocket: Map<number, PlayerStatusSocket> = new Map();

  constructor(private readonly profileService: ProfileService) {}

  public async setStatus(
    socket: AuthenticatedSocket,
    status: string,
  ): Promise<void> {
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

  public async removeStatus(socket: AuthenticatedSocket): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    this.playerStatusSocket.delete(profile.id);
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

  public async getAllStatus(): Promise<PlayerStatusDto[]> {
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
    return this.playerStatusSocket.get(profileId)?.socket;
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
