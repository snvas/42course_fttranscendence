export interface OAuth2User {
  id: number;
  email: string;
  displayName: string;
  otpEnabled?: boolean;
  otpValidated?: boolean;
  otpSecret?: string;
}
