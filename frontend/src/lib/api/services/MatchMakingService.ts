import type {AxiosInstance, AxiosResponse} from 'axios';
import axios from 'axios';
import type {MatchAnswerDto, MatchEventDto, MatchHistoryDto} from '$lib/dtos';

export class MatchMakingService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true
        });
    }

    public async getMatchHistory(): Promise<AxiosResponse<MatchHistoryDto[]>> {
        return this.axiosInstance.get('/history');
    }

    public async getPublicMatchHistory(id: string): Promise<AxiosResponse<MatchHistoryDto[]>> {
        return this.axiosInstance.get(`/history/public/${id}`);
    }

    public async joinMatchQueue(): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/queue/join');
    }

    public async cancelMatchQueue(): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/queue/leave');
    }

    public async createPrivateMatch(userId: number): Promise<AxiosResponse<MatchEventDto>> {
        return this.axiosInstance.post(`/private/create/${userId}`);
    }

    public async acceptMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/accept', {matchId, as} as MatchAnswerDto);
    }

    public async rejectMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/reject', {matchId, as} as MatchAnswerDto);
    }

    public async acceptPrivateMatch(matchId: string): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/private/accept', {matchId, as: 'p2'} as MatchAnswerDto);
    }

    public async rejectPrivateMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/private/reject', {matchId, as} as MatchAnswerDto);
    }

    /*public async acceptMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/accept', {matchId, as} as MatchAnswerDto, {
            'axios-retry': {
                retries: 3,
                retryDelay: axiosRetry.exponentialDelay
            }
        });
    }

    public async rejectMatch(matchId: string, as: 'p1' | 'p2'): Promise<AxiosResponse<void>> {
        return this.axiosInstance.post('/reject', {matchId, as} as MatchAnswerDto, {
            'axios-retry': {
                retries: 3,
                retryDelay: axiosRetry.exponentialDelay
            }
        });
    }*/
}

export const matchMakingService: MatchMakingService = new MatchMakingService(
    'http://localhost:3000/api/match'
);
