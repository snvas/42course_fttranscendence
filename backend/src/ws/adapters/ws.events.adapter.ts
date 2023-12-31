import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import passport from 'passport';
import express from 'express';
import { forwardRef, INestApplication, Inject, Logger } from '@nestjs/common';
import { AuthenticatedSocket } from '../../chat/types/authenticated-socket.type';
import { socketEvent } from '../ws-events';
import { StatusService } from '../../status/status.service';
import { GroupChatService } from '../../chat/services/group-chat.service';
import { PlayerStatusDto } from '../../profile/models/player-status.dto';

export class WsEventsAdapter extends IoAdapter {
  private readonly session: express.RequestHandler;
  private readonly logger: Logger = new Logger(WsEventsAdapter.name);
  private readonly playerService: StatusService;
  @Inject(forwardRef(() => GroupChatService))
  private readonly groupChatService: GroupChatService;

  constructor(session: express.RequestHandler, app: INestApplication) {
    super(app);
    this.session = session;
    this.playerService = app.get(StatusService);

    this.groupChatService = app.get(GroupChatService);
  }

  create(port: number, options?: any): Server {
    const server: Server = super.create(port, options);

    const wrap = (middleware: any) => (socket: any, next: any) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));

    server.on(
      'connection',
      async (socket: AuthenticatedSocket): Promise<void> => {
        this.logger.log(`### Client connected: ${socket.id}`);

        if (!this.isAuthenticatedSocket(socket)) {
          return;
        }

        this.logger.verbose(
          `Authenticated user socket: ${JSON.stringify(socket.request.user)}`,
        );

        this.playerService
          .set(socket, 'online')
          .then(() => {
            return this.groupChatService.getPlayerGroupChatNames(socket);
          })
          .then((rooms: string[]) => {
            socket.join(rooms);
            return this.playerService.getFrontEndStatus();
          })
          .then((playersStatus: PlayerStatusDto[]): void => {
            server.emit(socketEvent.PLAYERS_STATUS, playersStatus);
          })
          .catch((error): void => {
            this.logger.error(
              `On connect error occurred on socket adapter: ${error}`,
            );
            throw error;
          });

        socket.on('disconnect', this.handleDisconnect(socket));
      },
    );

    return server;
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    return async (): Promise<void> => {
      this.logger.log(`Client socket disconnected: ${socket.id}`);

      if (!this.isAuthenticatedSocket(socket)) {
        return;
      }

      this.playerService
        .remove(socket)
        .then(() => {
          return this.playerService.getFrontEndStatus();
        })
        .then((playersStatus: PlayerStatusDto[]): void => {
          socket.broadcast.emit(socketEvent.PLAYERS_STATUS, playersStatus);
        })
        .catch((error): void => {
          this.logger.error(
            `On disconnect error occurred on socket adapter: ${error}`,
          );
          throw error;
        });
    };
  }

  private isAuthenticatedSocket(socket: AuthenticatedSocket): boolean {
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
}
