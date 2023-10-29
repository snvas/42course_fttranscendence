import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ProfileFriend } from '../interfaces/profile-friend.interface';

export class ProfileFriendDto implements ProfileFriend {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsNumber()
  avatarId?: number;
}
