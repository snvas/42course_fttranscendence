import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';
import { MatchEventDto } from './models/match-event.dto';
import { MatchUpdatedDto } from './models/match-updated.dto';

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
    @Body() matchEventDto: MatchEventDto,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.acceptMatch(
      matchEventDto.matchId,
      matchEventDto.as,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('reject')
  async rejectMatch(
    @Body() matchEventDto: MatchEventDto,
  ): Promise<MatchEventDto> {
    return await this.matchService.rejectMatch(
      matchEventDto.matchId,
      matchEventDto.as,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put('finish')
  async finishMatch(
    @Req() { user }: { user: FortyTwoUserDto }, // @Body() matchEventDto: FinishMatchDto,
  ) {
    //return await this.matchService.finishMatch(user.id);
  }
}
