import { OAuth2User } from '../interfaces/fortytwo-user.interface';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class Oauth2UserDto implements OAuth2User {
  @IsNumber()
  id: number;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  displayName: string;
  @IsBoolean()
  @IsOptional()
  otpEnabled?: boolean;
  @IsBoolean()
  @IsOptional()
  otpValidated?: boolean;
  @IsBoolean()
  @IsOptional()
  @Exclude()
  otpSecret?: string;
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  constructor(partial: Partial<Oauth2UserDto>) {
    Object.assign(this, partial);
  }
}
