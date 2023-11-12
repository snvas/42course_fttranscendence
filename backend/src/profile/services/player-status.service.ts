import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatusSocket } from '../../chat/types/player-status.socket';
import { AuthenticatedSocket } from '../../chat/types/authenticated-socket.type';
import { ProfileDTO } from '../models/profile.dto';
import { PlayerStatusDto } from '../models/player-status.dto';
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

  public async removePlayerStatus(socket: AuthenticatedSocket): Promise<void> {
    const profile: ProfileDTO = await this.profileService.findByUserId(
      socket.request.user.id,
    );

    this.playerStatusSocket.delete(profile.id);
  }

  public async getPlayerFrontEndStatus(): Promise<PlayerStatusDto[]> {
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

  public async getAllPlayersStatus(): Promise<PlayerStatusDto[]> {
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

    const players: PlayerStatusDto[] = await this.getPlayerFrontEndStatus();

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
