import { Socket } from 'socket.io';
import { Oauth2UserDto } from '../../user/models/oauth2-user.dto';

export type AuthenticatedSocket = Socket & {
  request: { user: Oauth2UserDto };
};
