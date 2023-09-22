import { PassportSerializer } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { FortyTwoUser } from '../index';
import { UserService } from '../../user/user.service';
import { UserEntity } from '../../db/entities';

//This class is used to serialize and deserialize the session with user data
@Injectable()
export class SessionSerializer extends PassportSerializer {
  private readonly logger: Logger = new Logger(SessionSerializer.name);

  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(
    user: FortyTwoUser,
    done: (err: any, user: FortyTwoUser) => void,
  ) {
    this.logger.verbose(`### Serializing user [${user.id}]`);
    done(null, user);
  }

  async deserializeUser(
    payload: FortyTwoUser,
    done: (err: any, user: FortyTwoUser | null) => void,
  ) {
    this.logger.verbose(`### Deserializing user [${payload.id}]`);
    const user: UserEntity | null = await this.userService.findById(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
