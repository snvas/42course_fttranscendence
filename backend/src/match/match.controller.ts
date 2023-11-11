import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { MatchUpdatedDto } from './models/match-updated.dto';
import { MatchAnswer } from './interfaces/match-answer.interface';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('queue/join')
  async joinMatchQueue(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    await this.matchService.handleMatchStatus(user.id, 'waitingMatch');
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('queue/leave')
  async leaveMatchQueue(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    await this.matchService.handleMatchStatus(user.id, 'online');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('accept')
  async acceptMatch(
    @Body() matchAnswerDto: MatchAnswer,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.acceptMatch(
      matchAnswerDto.matchId,
      matchAnswerDto.as,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('reject')
  async rejectMatch(
    @Body() matchAnswerDto: MatchAnswer,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.rejectMatch(matchAnswerDto.matchId);
  }
}
