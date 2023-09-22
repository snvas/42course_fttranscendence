import { IsNotEmpty, IsString } from 'class-validator';
import { OneTimePassword } from '../interfaces/one-time-password.interface';

export class OneTimePasswordDto implements OneTimePassword {
  @IsString()
  @IsNotEmpty()
  code: string;
}
