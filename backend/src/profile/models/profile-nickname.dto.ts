import { ProfileNickname } from '../interfaces/profile-nickname.interface';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProfileNicknameDto implements ProfileNickname {
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
