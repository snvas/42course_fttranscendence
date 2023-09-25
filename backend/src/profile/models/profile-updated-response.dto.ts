import { ProfileUpdatedResponse } from '../interfaces/profile-updated-respose.interface';
import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class ProfileUpdatedResponseDto implements ProfileUpdatedResponse {
  @IsBoolean()
  @IsNotEmpty()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
