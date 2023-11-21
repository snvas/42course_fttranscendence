import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ProfileService } from '../../profile/profile.service';
import { ProfileDTO } from '../../profile/models/profile.dto';
import { Oauth2UserDto } from '../../user/models/oauth2-user.dto';
import { MatchAnswerDto } from '../models/match-answer.dto';
import { MatchService } from '../match.service';
import { MatchEntity } from '../../db/entities';

@Injectable()
export class MatchAnswerGuard implements CanActivate {
  private readonly logger: Logger = new Logger(MatchAnswerGuard.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly matchService: MatchService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: Oauth2UserDto = request.user as Oauth2UserDto;
    const profile: ProfileDTO = await this.profileService.findByUserId(user.id);
    const matchAnswerDto: MatchAnswerDto = request.body as MatchAnswerDto;

    const matchEntity: MatchEntity = await this.matchService.getMatchById(
      matchAnswerDto.matchId,
    );

    if (matchEntity.p1.id !== profile.id && matchEntity.p2.id !== profile.id) {
      this.logger.warn(
        `### Rejected, profile [${profile.id}] is not in Match: [${matchAnswerDto.matchId}]`,
      );

      return false;
    }

    return true;
  }
}
