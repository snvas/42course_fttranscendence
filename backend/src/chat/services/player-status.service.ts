import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatusSocket } from '../types/player-status.socket';
import { AuthenticatedSocket } from '../types/authenticated-socket.type';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { PlayerStatusDto } from '../models/player/player-status.dto';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class PlayerStatusService {
  private readonly logger: Logger = new Logger(PlayerStatusService.name);
  private playerStatusSocket: Map<number, PlayerStatusSocket> = new Map();

  constructor(private readonly profileService: ProfileService) {}

  public isPlayerAuthenticated(socket: AuthenticatedSocket): boolean {
    if (
      socket.request.user === undefined ||
      socket.request.user.id === undefined
    ) {
      this.logger.warn(`### User not authenticated: [${socket.id}]`);
      socket.emit('unauthorized', 'User not authenticated');
      socket.disconnect();
      return false;
    }

    return true;
  }

  public async setPlayerStatus(
    socket: AuthenticatedSocket,
    status: string,
  ): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    const onlineUser: PlayerStatusSocket = {
      id: profile.id,
      nickname: profile.nickname,
      avatarId: profile.avatarId,
      status,
      socket,
    };

    this.playerStatusSocket.set(profile.id, onlineUser);
  }

  public async removePlayerStatus(socket: AuthenticatedSocket): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    this.playerStatusSocket.delete(profile.id);
  }

  public async getPlayersStatus(): Promise<PlayerStatusDto[]> {
    const onlineUserSocket: PlayerStatusSocket[] = Array.from(
      this.playerStatusSocket.values(),
    );

    const playerStatus: PlayerStatusDto[] = onlineUserSocket.map(
      (onlineUser: PlayerStatusSocket): PlayerStatusDto => {
        return {
          id: onlineUser.id,
          nickname: onlineUser.nickname,
          status: onlineUser.status,
          avatarId: onlineUser.avatarId,
        } as PlayerStatusDto;
      },
    );

    this.logger.debug(
      `### Online users nicknames: [${playerStatus.map(
        (u: PlayerStatusDto) => u.nickname,
      )}]`,
    );

    return playerStatus;
  }

  public async getPlayerSocket(
    profileId: number,
  ): Promise<AuthenticatedSocket | undefined> {
    return this.playerStatusSocket.get(profileId)?.socket;
  }

  public async addPlayerRoom(profileId: number, room: string): Promise<void> {
    const socket: AuthenticatedSocket | undefined = await this.getPlayerSocket(
      profileId,
    );

    if (!socket) {
      return;
    }

    socket.join(room);

    this.logger.verbose(`### Player [${profileId}] joined room [${room}]`);
  }

  public async removePlayerRoom(
    profileId: number,
    room: string,
  ): Promise<void> {
    const socket: AuthenticatedSocket | undefined = await this.getPlayerSocket(
      profileId,
    );

    if (!socket) {
      return;
    }

    socket.leave(room);
  }
}
