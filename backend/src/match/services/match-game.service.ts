import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity } from '../../db/entities';
import { Repository } from 'typeorm';
import { ProfileService } from '../../profile/profile.service';
import { MatchService } from '../match.service';

@Injectable()
export class MatchGameService {
  /**
   * Constructs a new instance of the MatchGameService class.
   * @param matchRepository - The repository for MatchEntity.
   * @param profileService - The service for managing profiles.
   * @param matchService - The service for managing matches.
   */
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    private readonly profileService: ProfileService,
    private readonly matchService: MatchService,
  ) {}

  /**
   * Retrieves the match points for a given match.
   * @param matchId - The ID of the match.
   * @returns A promise that resolves to an object containing the player 1 score (p1Score) and player 2 score (p2Score).
   */
  public async getMatchPoints(
    matchId: string,
  ): Promise<{ p1Score: number; p2Score: number }> {
    const match: MatchEntity = await this.getMatch(matchId);
    return {
      p1Score: match.p1Score,
      p2Score: match.p2Score,
    };
  }

  /**
   * Saves the points for a match.
   * @param matchId - The ID of the match.
   * @param player - The player ('p1' or 'p2') whose score needs to be incremented.
   * @returns A Promise that resolves to the updated MatchEntity.
   */
  public async savePoints(
    matchId: string,
    player: 'p1' | 'p2',
  ): Promise<MatchEntity> {
    const match: MatchEntity = await this.getMatch(matchId);

    if (player === 'p1') {
      match.p1Score += 1;
    } else {
      match.p2Score += 1;
    }

    return await this.matchRepository.save(match);
  }

  /**
   * Finish a match and update the corresponding player profiles and match status.
   * @param matchId - The ID of the match to finish.
   * @returns A promise that resolves to the updated MatchEntity object.
   */
  public async finishMatch(matchId: string): Promise<MatchEntity> {
    const match: MatchEntity = await this.getMatch(matchId);
    if (!match.p1 || !match.p2) {
      throw new NotFoundException('Players not found in match [${matchId}}]');
    }
    const winner: 'p1' | 'p2' = this.getWinner(match);

    if (winner === 'p1') {
      await this.profileService.updateByProfileId(match.p1.id, {
        level: match.p1.level + 40,
        wins: match.p1.wins + 1,
      });
      await this.profileService.updateByProfileId(match.p2.id, {
        losses: match.p2.losses + 1,
      });
    } else {
      await this.profileService.updateByProfileId(match.p1.id, {
        losses: match.p1.losses + 1,
      });
      await this.profileService.updateByProfileId(match.p2.id, {
        level: match.p2.level + 40,
        wins: match.p2.wins + 1,
      });
    }

    await this.matchService.handleMatchStatus(match.p1.id, 'online');
    await this.matchService.handleMatchStatus(match.p2.id, 'online');

    match.status = 'finished';
    match.winner = winner;
    return await this.matchRepository.save(match);
  }

  /**
   * Abandons a match and updates the profiles of the players involved.
   * @param matchId - The ID of the match to abandon.
   * @param by - The player who is abandoning the match ('p1' or 'p2').
   * @returns A Promise that resolves to the updated MatchEntity.
   */
  public async abandonMatch(
    matchId: string,
    by: 'p1' | 'p2',
  ): Promise<MatchEntity> {
    console.log(`Abandon Match: ${matchId}, by: ${by}`);
    const match: MatchEntity = await this.getMatch(matchId);
    if (by === 'p1') {
      await this.profileService.updateByProfileId(match.p1.id, {
        losses: match.p1.losses + 1,
      });
      await this.profileService.updateByProfileId(match.p2.id, {
        level: match.p2.level + 20,
        wins: match.p2.wins + 1,
      });
    } else {
      await this.profileService.updateByProfileId(match.p1.id, {
        level: match.p1.level + 20,
        wins: match.p1.wins + 1,
      });
      await this.profileService.updateByProfileId(match.p2.id, {
        losses: match.p2.losses + 1,
      });
    }

    await this.matchService.handleMatchStatus(match.p1.id, 'online');
    await this.matchService.handleMatchStatus(match.p2.id, 'online');

    match.status = 'abandoned';
    match.winner = by === 'p1' ? 'p2' : 'p1';
    return await this.matchRepository.save(match);
  }

  /**
   * Determines the winner of a match based on the scores of the players.
   * @param match - The match entity containing the scores of the players.
   * @returns The identifier of the winning player ('p1' or 'p2').
   */
  private getWinner(match: MatchEntity): 'p1' | 'p2' {
    return match.p1Score > match.p2Score ? 'p1' : 'p2';
  }

  /**
   * Retrieves a match entity by its ID.
   * @param matchId - The ID of the match to retrieve.
   * @returns A promise that resolves to the retrieved MatchEntity.
   * @throws NotFoundException if the match is not found or if the players of the match are not found.
   */
  private async getMatch(matchId: string): Promise<MatchEntity> {
    const match: MatchEntity | null = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: {
        p1: true,
        p2: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match [${matchId}]not found');
    }

    if (!match.p1 || !match.p2) {
      throw new NotFoundException('Players not found in match [${matchId}}]');
    }
    return match;
  }
}
