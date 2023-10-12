import { Socket } from 'socket.io';
import { FortyTwoUserDto } from '../../user/models/forty-two-user.dto';

export type AuthenticatedSocketType = Socket & {
  request: { user: FortyTwoUserDto };
};
