import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

/**
 * Controller for handling game related operations.
 */
@Controller('game')
export class GameController {
  login = 1;

  /**
   * Defines the player based on the login count.
   * @returns The command representing the player.
   */
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
