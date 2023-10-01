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

/*
import * as cookieParser from 'cookie-parser';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {
    // A sample encrypted session cookie
    const encryptedCookie = 'your-encrypted-cookie-value';
    const secret = 'your-secret-key'; // Replace with your secret key

    // Manually parse the cookie
    const parsedCookie = cookieParser.signedCookie(
      encryptedCookie,
      secret
    );

    // Check if the parsed cookie exists and is not expired
    if (parsedCookie && parsedCookie.expires > Date.now()) {
      console.log('Session is valid.');
    } else {
      console.log('Session is expired or invalid.');
    }
  }
}
  // Register WebSocket handlers
  io.on('connection', (socket: Socket) => {
    // Access cookies
    const cookies = socket.handshake.headers.cookie;

    // Access session data
    const sessionData = socket.handshake.session;

    // Handle WebSocket events here
    socket.on('your-websocket-event', (data) => {
      // Handle WebSocket event
    });
  });

 */
