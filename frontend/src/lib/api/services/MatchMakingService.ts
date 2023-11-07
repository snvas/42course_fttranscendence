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

    public async joinMatch(): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/start');
    }

    public async cancelMatch(): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/cancel');
    }
}

export const matchMakingService: MatchMakingService = new MatchMakingService(
    'http://localhost:3000/api/match'
);
