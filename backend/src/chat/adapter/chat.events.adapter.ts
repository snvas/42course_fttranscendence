import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import sharedsession from './chat.socket-io.session.middleware';
import { INestApplication } from '@nestjs/common';

export class EventsAdapter extends IoAdapter {
  private app: INestApplication;

  constructor(app: INestApplication) {
    super(app);
    this.app = app;
  }

  createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, options);
    const configService: ConfigService = this.app.get(ConfigService);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const session = require('express-session')({
      secret: configService.get('APP_SESSION_SECRET'),
      saveUninitialized: true,
      resave: true,
    });

    console.log(
      '#################### CREATING SESSION IO SERVER ####################',
    );

    this.app.use(session);
    server.use(
      sharedsession(session, {
        autoSave: true,
      }),
    );
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
