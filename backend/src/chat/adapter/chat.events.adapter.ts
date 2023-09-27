import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { ServerOptions } from 'socket.io';
import passport from 'passport';
import express from 'express';

/**
 * Enable session tokens for web sockets by using express-socket.io-session
 */
export class SessionAdapter extends IoAdapter {
  private readonly session: express.RequestHandler;

  constructor(session: express.RequestHandler) {
    super(session);
    this.session = session;
  }

  create(port: number, options?: ServerOptions): Server {
    const server: Server = super.create(port, options);

    const wrap = (middleware: any) => (socket: any, next: any) =>
      middleware(socket.request, {}, next);

    server.use((socket, next) => {
      socket.data.username = 'test'; //passing random property to see if use method is working
      next();
    });
    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    return server;
  }
}
