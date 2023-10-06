import { ProfileUpdatedResponse } from '../interfaces/profile-updated-respose.interface';
import { IsBoolean, IsNumber, IsPositive } from 'class-validator';

export class ProfileUpdatedResponseDto implements ProfileUpdatedResponse {
  @IsBoolean()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
