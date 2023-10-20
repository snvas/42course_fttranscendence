import { IsBoolean, IsNumber, IsPositive } from 'class-validator';

export class PasswordUpdateResponseDto {
  @IsBoolean()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
