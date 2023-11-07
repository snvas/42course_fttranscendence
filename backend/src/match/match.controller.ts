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
  @Post('join')
  async joinMatchQueue(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    await this.matchService.handleMatchStatus(user.id, 'waiting_match');
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('leave')
  async leaveMatchQueue(
    @Req() { user }: { user: FortyTwoUserDto },
  ): Promise<void> {
    await this.matchService.handleMatchStatus(user.id, 'online');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async createMatch(
    @Req() { user }: { user: FortyTwoUserDto }, // @Body() matchEventDto: CreateMatchDto,
  ) {
    //return await this.matchService.createMatch(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('finish')
  async finishMatch(
    @Req() { user }: { user: FortyTwoUserDto }, // @Body() matchEventDto: FinishMatchDto,
  ) {
    //return await this.matchService.finishMatch(user.id);
  }
}
