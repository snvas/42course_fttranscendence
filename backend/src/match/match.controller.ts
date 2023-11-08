import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';

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

  @HttpCode(HttpStatus.OK)
  @Put('finish')
  async finishMatch(
    @Req() { user }: { user: FortyTwoUserDto }, // @Body() matchEventDto: FinishMatchDto,
  ) {
    //return await this.matchService.finishMatch(user.id);
  }
}
