import { SetMetadata } from '@nestjs/common';

export const IS_TWO_FACTOR_AUTH = 'is2FA';
export const TwoFactorAuthentication = () =>
  SetMetadata(IS_TWO_FACTOR_AUTH, true);
