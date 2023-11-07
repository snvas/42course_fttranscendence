import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { MatchService } from './match.service';
import { FortyTwoUserDto } from '../user/models/forty-two-user.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('start')
  async startMatch(@Req() { user }: { user: FortyTwoUserDto }): Promise<void> {
    await this.matchService.handleMatchStatus(user.id, 'waiting_match');
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('cancel')
  async cancelMatch(@Req() { user }: { user: FortyTwoUserDto }): Promise<void> {
    await this.matchService.handleMatchStatus(user.id, 'waiting_match');
  }
}
