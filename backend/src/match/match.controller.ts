/**
 * Controller responsible for handling match-related requests.
 */
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
  UseGuards,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { Oauth2UserDto } from '../user/models/oauth2-user.dto';
import { MatchUpdatedDto } from './models/match-updated.dto';
import { MatchHistoryDto } from './models/match-history.dto';
import { MatchAnswerDto } from './models/match-answer.dto';
import { MatchAnswerGuard } from './guards/match-answer.guard';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * Retrieves the match history for the authenticated user.
   * @param user - The authenticated user.
   * @returns A promise that resolves to an array of MatchHistoryDto objects.
   */
  @HttpCode(HttpStatus.OK)
  @Get('history')
  async getMatchHistory(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<MatchHistoryDto[]> {
    return await this.matchService.getMatchHistory(user.id);
  }

  /**
   * Joins the match queue for the authenticated user.
   * @param user - The authenticated user.
   * @returns A promise that resolves when the user successfully joins the match queue.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('queue/join')
  async joinMatchQueue(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<void> {
    await this.matchService.handleUserMatchStatus(user.id, 'waitingMatch');
  }

  /**
   * Leaves the match queue for the authenticated user.
   * @param user - The authenticated user.
   * @returns A promise that resolves when the user successfully leaves the match queue.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('queue/leave')
  async leaveMatchQueue(
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<void> {
    await this.matchService.handleUserMatchStatus(user.id, 'online');
  }

  /**
   * Creates a private match between the authenticated user and the specified profile.
   * @param profileId - The ID of the profile to create the private match with.
   * @param user - The authenticated user.
   * @returns A promise that resolves when the private match is successfully created.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('private/create/:profileId')
  async createPrivateMatch(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Req() { user }: { user: Oauth2UserDto },
  ): Promise<void> {
    return await this.matchService.joinPrivateMatch(user.id, profileId);
  }

  /**
   * Accepts a match request.
   * @param matchAnswerDto - The match answer DTO containing the match ID and the answer.
   * @returns A promise that resolves to the updated match DTO.
   */
  @UseGuards(MatchAnswerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('accept')
  async acceptMatch(
    @Body() matchAnswerDto: MatchAnswerDto,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.acceptMatch(
      matchAnswerDto.matchId,
      matchAnswerDto.as,
    );
  }

  /**
   * Rejects a match request.
   * @param matchAnswerDto - The match answer DTO containing the match ID.
   * @returns A promise that resolves to the updated match DTO.
   */
  @UseGuards(MatchAnswerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('reject')
  async rejectMatch(
    @Body() matchAnswerDto: MatchAnswerDto,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.rejectMatch(matchAnswerDto.matchId);
  }

  /**
   * Accepts a private match request.
   * @param matchAnswerDto - The match answer DTO containing the match ID and the answer.
   * @returns A promise that resolves to the updated match DTO.
   */
  @UseGuards(MatchAnswerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('private/accept')
  async acceptPrivateMatch(
    @Body() matchAnswerDto: MatchAnswerDto,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.acceptMatch(
      matchAnswerDto.matchId,
      matchAnswerDto.as,
      'private',
    );
  }

  /**
   * Rejects a private match request.
   * @param matchAnswerDto - The match answer DTO containing the match ID.
   * @returns A promise that resolves to the updated match DTO.
   */
  @UseGuards(MatchAnswerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('private/reject')
  async rejectPrivateMatch(
    @Body() matchAnswerDto: MatchAnswerDto,
  ): Promise<MatchUpdatedDto> {
    return await this.matchService.rejectMatch(
      matchAnswerDto.matchId,
      'private',
    );
  }
}
