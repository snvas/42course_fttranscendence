import { Socket } from 'socket.io';
import { RequestHandler } from 'express';
import { Session, SessionData } from 'express-session';

declare module 'socket.io' {
  interface Handshake {
    session?: (Session & Partial<SessionData>) | undefined;
    sessionID?: string | undefined;
  }
}

const sharedsession =
  (
    expressSessionMiddleware: RequestHandler,
    options?: SharedSessionOptions,
  ): SocketIoSharedSessionMiddleware =>
  (socket: Socket, next: (err?: any) => void) => {
    //nothing
  };

interface SharedSessionOptions {
  autoSave?: boolean;
  saveUninitialized?: boolean;
}

type SocketIoSharedSessionMiddleware = (
  socket: Socket,
  next: (err?: any) => void,
) => void;

export default sharedsession;
