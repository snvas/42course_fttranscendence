import type {AxiosInstance, AxiosResponse} from 'axios';
import axios from 'axios';
import type {MatchAnswerDto} from '$lib/dtos';

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

    public async acceptMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/accept', {matchId, as} as MatchAnswerDto);
    }

    public async rejectMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/reject', {matchId, as} as MatchAnswerDto);
    }
}

export const matchMakingService: MatchMakingService = new MatchMakingService(
    'http://localhost:3000/api/match'
);
