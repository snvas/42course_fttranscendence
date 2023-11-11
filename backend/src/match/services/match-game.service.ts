import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchEntity } from '../../db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class MatchGameService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
  ) {}

  public async savePoints(
    matchId: string,
    playerId: number,
  ): Promise<MatchEntity> {
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

    if (match.p1.id !== playerId && match.p2.id !== playerId) {
      throw new NotFoundException('Player not found');
    }

    if (match.p1.id === playerId) {
      match.p1Score += 1;
    } else {
      match.p2Score += 1;
    }

    return await this.matchRepository.save(match);
  }
}
