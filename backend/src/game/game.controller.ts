import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('game')
export class GameController {
  login = 1;

  @HttpCode(HttpStatus.OK)
  @Get()
  async definePlayer() {
    let cmd = 'player1';
    if (this.login % 2 == 0) {
      cmd = 'player2';
    }
    this.login++;
    return cmd;
  }
}
