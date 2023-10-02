import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import passport from 'passport';
import express from 'express';
import { INestApplication } from '@nestjs/common';

export class EventsAdapter extends IoAdapter {
  private session: express.RequestHandler;

  constructor(session: express.RequestHandler, app: INestApplication) {
    super(app);
    this.session = session;
  }

  create(port: number, options?: any): Server {
    const server: Server = super.create(port, options);

    const wrap = (middleware: any) => (socket: any, next: any) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    return server;
  }
}
