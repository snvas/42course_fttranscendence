import axios, { AxiosInstance } from "axios";
import { AxiosResponse } from "axios";
import { FortyTwoUserDto } from "../../backend/src/user/models/forty-two-user.dto.ts";
import { ResponseMessageDto } from "../../backend/src/auth/models/response-message.dto.ts";
import { OneTimePasswordDto } from "../../backend/src/auth/models/one-time-password.dto.ts";

class AuthService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
    });
  }

  public async logoutUser(): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.get('/logout');
  }

  public async validateUserSession(): Promise<AxiosResponse<FortyTwoUserDto>> {
    return this.axiosInstance.get('/session');
  }

  public async validate2FASession(): Promise<AxiosResponse<FortyTwoUserDto>> {
    return this.axiosInstance.get('/2fa/session');
  }


  public async enable2FA(code: string): Promise<AxiosResponse<ResponseMessageDto>>  {
    return this.axiosInstance.post('/2fa/turn-on', { code } as OneTimePasswordDto);
  }

  public async disable2FA(): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.post('/2fa/turn-off', {});
  }

  public async validateOTP(code: string): Promise<AxiosResponse<ResponseMessageDto>> {
    return this.axiosInstance.post('/2fa/validate', { code });
  }

  public async get2FAQRCode(): Promise<AxiosResponse<string>> {
    return this.axiosInstance.get('/2fa/qr-code');
  }
}

const authService: AuthService = new AuthService('http://localhost:3000/api/auth');

export default authService;