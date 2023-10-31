import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatusSocket } from '../../chat/types/player-status.socket';
import { AuthenticatedSocket } from '../../chat/types/authenticated-socket.type';
import { ProfileDTO } from '../models/profile.dto';
import { PlayerStatusDto } from '../../chat/models/player/player-status.dto';
import { ProfileService } from '../profile.service';
import { SimpleProfileDto } from '../models/simple-profile.dto';
import { BlockService } from './block.service';

@Injectable()
export class PlayerStatusService {
  private readonly logger: Logger = new Logger(PlayerStatusService.name);
  private playerStatusSocket: Map<number, PlayerStatusSocket> = new Map();

  constructor(
    private readonly profileService: ProfileService,
    private readonly blockService: BlockService,
  ) {}

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

  public async getBlockedByPlayersSockets(
    socket: AuthenticatedSocket,
  ): Promise<string[]> {
    const blockedUsers: SimpleProfileDto[] =
      await this.blockService.getBlockedBy(socket.request.user.id);

    const players: PlayerStatusDto[] = await this.getPlayersStatus();

    const blockedPlayersSockets: string[] = (
      await Promise.all(
        players.map(
          async (
            player: PlayerStatusDto,
          ): Promise<AuthenticatedSocket | undefined> => {
            const socket: AuthenticatedSocket | undefined =
              await this.getPlayerSocket(player.id);
            if (
              socket !== undefined &&
              blockedUsers.some(
                (blocked: SimpleProfileDto): boolean =>
                  blocked.id === player.id,
              )
            ) {
              return socket;
            }
            return undefined;
          },
        ),
      )
    )
      .filter(
        (socket: AuthenticatedSocket | undefined): boolean =>
          socket !== undefined,
      )
      .map((socket: AuthenticatedSocket) => socket.id as string);

    this.logger.verbose(
      `### Blocked players sockets: [${blockedPlayersSockets}]`,
    );

    return blockedPlayersSockets;
  }
}
