import { FortyTwoUser } from "../../../../backend/dist/user/interfaces/fortytwo-user.interface";

export interface AuthContextData {
  user: FortyTwoUser | null;
  logoutUser: () => void;
  enable2FA: (code: string) => Promise<boolean>;
  disable2FA: () => void;
  validateOTP: (code: string) => Promise<boolean>;
}
