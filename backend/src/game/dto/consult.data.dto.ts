import { IsNotEmpty, IsString } from 'class-validator';

export class ConsultDataDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
