import { IsBoolean, IsNumber, IsPositive } from 'class-validator';
import { MemberRoleUpdatedResponse } from '../interfaces/member-updated-response.interface';

export class MemberUpdatedResponseDto implements MemberRoleUpdatedResponse {
  @IsBoolean()
  updated: boolean;
  @IsNumber()
  @IsPositive()
  affected: number;
}
