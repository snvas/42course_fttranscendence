import { FortyTwoUser } from "../../../backend/src/auth";

export interface AuthContextData {
  user: FortyTwoUser | null;
  logoutUser: () => void;
  enable2FA: (code: string) =>  Promise<boolean>;
  disable2FA: () => void;
  validateOTP: (code: string) => Promise<boolean>;
}