import type {AxiosInstance, AxiosResponse} from 'axios';
import axios from 'axios';

export class MatchMakingService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true
        });
    }

    public async joinMatchQueue(): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/queue/join');
    }

    public async cancelMatchQueue(): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/queue/leave');
    }
}

export const matchMakingService: MatchMakingService = new MatchMakingService(
    'http://localhost:3000/api/match'
);
