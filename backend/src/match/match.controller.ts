import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { MatchUpdatedDto } from './models/match-updated.dto';
import { MatchAnswer } from './interfaces/match-answer.interface';
import { MatchHistoryDto } from './models/match-history.dto';
import { MatchAnswerDto } from './models/match-answer.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @HttpCode(HttpStatus.OK)
  @Get('history')
  async getMatchHistory(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<MatchHistoryDto[]> {
    return await this.matchService.getMatchHistory(user.id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('queue/join')
  async joinMatchQueue(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    await this.matchService.handleUserMatchStatus(user.id, 'waitingMatch');
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('queue/leave')
  async leaveMatchQueue(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    await this.matchService.handleUserMatchStatus(user.id, 'online');
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
    @Body() matchAnswerDto: MatchAnswerDto,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.rejectMatch(matchAnswerDto.matchId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('private/:profileId')
  async createPrivateMatch(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    return await this.matchService.joinPrivateMatch(user.id, profileId);
  }
}
