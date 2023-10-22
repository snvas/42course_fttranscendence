import { IsBoolean, IsNumber, IsPositive } from 'class-validator';

export class MemberRoleUpdatedResponseDto {
  @IsBoolean()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
