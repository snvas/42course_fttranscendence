import type {AxiosInstance, AxiosResponse} from 'axios';
import axios from 'axios';
import type {Oauth2UserDto, OneTimePasswordDto, ResponseMessageDto} from '$lib/dtos';

class AuthService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true
        });
    }

    public async logoutUser(): Promise<AxiosResponse<ResponseMessageDto>> {
        return this.axiosInstance.get('/logout');
    }

    public async validateUserSession(): Promise<AxiosResponse<Oauth2UserDto>> {
        return this.axiosInstance.get('/session');
    }

    public async validateUniqueUserSession(): Promise<AxiosResponse<Oauth2UserDto>> {
        return this.axiosInstance.get('/session/unique-validation');
    }

    public async destroyOldUserSessions(): Promise<AxiosResponse<Oauth2UserDto>> {
        return this.axiosInstance.post('/session/destroy-old');
    }

    public async validate2FASession(): Promise<AxiosResponse<Oauth2UserDto>> {
        return this.axiosInstance.get('/2fa/session');
    }

    public async enable2FA(code: string): Promise<AxiosResponse<ResponseMessageDto>> {
        return this.axiosInstance.post('/2fa/turn-on', {code} as OneTimePasswordDto);
    }

    public async disable2FA(): Promise<AxiosResponse<ResponseMessageDto>> {
        return this.axiosInstance.post('/2fa/turn-off', {});
    }

    public async validateOTP(code: string): Promise<AxiosResponse<ResponseMessageDto>> {
        return this.axiosInstance.post('/2fa/validate', {code});
    }

    public async get2FAQRCode(): Promise<AxiosResponse<string>> {
        return this.axiosInstance.get('/2fa/qr-code');
    }
}

export const authService: AuthService = new AuthService(import.meta.env.VITE_API_URL +'/api/auth');
