import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity } from '../../db/entities';
import { Repository } from 'typeorm';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class MatchGameService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    private readonly profileService: ProfileService,
  ) {}

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

  public async finishMatch(matchId: string): Promise<MatchEntity> {
    const match: MatchEntity = await this.getMatch(matchId);
    const winner: 'p1' | 'p2' | 'draw' = this.getWinner(match);

    if (winner === 'p1') {
      await this.profileService.update(match.p1.id, {
        level: match.p1.level + 40,
        wins: match.p1.wins + 1,
      });
    } else {
      await this.profileService.update(match.p2.id, {
        level: match.p2.level + 10,
        wins: match.p2.losses + 1,
      });
    }

    match.status = 'finished';
    match.winner = winner;
    return await this.matchRepository.save(match);
  }

  public async abandonMatch(
    matchId: string,
    by: 'p1' | 'p2',
  ): Promise<MatchEntity> {
    const match: MatchEntity = await this.getMatch(matchId);

    if (by === 'p1') {
      await this.profileService.update(match.p1.id, {
        wins: match.p1.losses + 1,
      });
      await this.profileService.update(match.p2.id, {
        level: match.p2.level + 20,
        wins: match.p2.wins + 1,
      });
    } else {
      await this.profileService.update(match.p1.id, {
        level: match.p1.level + 20,
        wins: match.p1.wins + 1,
      });
      await this.profileService.update(match.p2.id, {
        wins: match.p2.losses + 1,
      });
    }

    match.status = 'abandoned';
    match.winner = by === 'p1' ? 'p2' : 'p1';
    return await this.matchRepository.save(match);
  }

  private getWinner(match: MatchEntity): 'p1' | 'p2' | 'draw' {
    return match.p1Score === match.p2Score
      ? 'draw'
      : match.p1Score > match.p2Score
      ? 'p1'
      : 'p2';
  }

  private async getMatch(matchId: string): Promise<MatchEntity> {
    const match: MatchEntity | null = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: {
        p1: true,
        p2: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (!match.p1 || !match.p2) {
      throw new NotFoundException('Match players not found');
    }
    return match;
  }
}
