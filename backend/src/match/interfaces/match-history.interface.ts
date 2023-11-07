import { SimpleProfileDto } from '../../profile/models/simple-profile.dto';

export interface MatchHistory {
  id: string;
  status: string;
  p1: SimpleProfileDto;
  p2: SimpleProfileDto;
  p1Joined: boolean;
  p2Joined: boolean;
  p1Score: number;
  p2Score: number;
  winner: 'p1' | 'p2' | 'draw';
  createdAt: Date;
  updatedAt: Date;
}
