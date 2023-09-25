import { ProfileDeletedResponse } from '../interfaces/profile-deleted-response.interface';
import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class ProfileDeletedResponseDto implements ProfileDeletedResponse {
  @IsBoolean()
  @IsNotEmpty()
  deleted: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
