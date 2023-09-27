import axios, { AxiosInstance } from "axios";
import { AxiosResponse } from "axios";
import { ResponseMessageDto } from "../../../backend/dist/auth/models/response-message.dto";
import { FortyTwoUserDto } from "../../../backend/dist/user/models/forty-two-user.dto";
import { OneTimePasswordDto } from "../../../backend/dist/auth/models/one-time-password.dto";

class AuthService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
    });
  }

  public async logoutUser(): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.get("/logout");
  }

  public async validateUserSession(): Promise<AxiosResponse<FortyTwoUserDto>> {
    return this.axiosInstance.get("/session");
  }

  public async validate2FASession(): Promise<AxiosResponse<FortyTwoUserDto>> {
    return this.axiosInstance.get("/2fa/session");
  }

  public async enable2FA(
    code: string
  ): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.post("/2fa/turn-on", {
      code,
    } as OneTimePasswordDto);
  }

  public async disable2FA(): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.post("/2fa/turn-off", {});
  }

  public async validateOTP(
    code: string
  ): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.post("/2fa/validate", { code });
  }

  public async get2FAQRCode(): Promise<AxiosResponse<string>> {
    return this.axiosInstance.get("/2fa/qr-code");
  }
}

const authService: AuthService = new AuthService(
  "http://localhost:3000/api/auth"
);

export default authService;
