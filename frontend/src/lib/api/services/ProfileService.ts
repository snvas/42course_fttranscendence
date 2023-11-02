import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ProfileDTO, ProfileDeletedResponseDto, SimpleProfileDto } from '$lib/dtos';

export class ProfileService {
	private axiosInstance: AxiosInstance;

	constructor(baseURL: string) {
		this.axiosInstance = axios.create({
			baseURL,
			withCredentials: true
		});
	}

	public async getProfile(): Promise<AxiosResponse<ProfileDTO>> {
		return this.axiosInstance.get('');
	}

	public async getAvatarImage(avatarId: number): Promise<AxiosResponse<Blob>> {
		return this.axiosInstance.get(`/avatar/${avatarId}`, {
			responseType: 'blob'
		});
	}

	public async createProfile(nickname: string): Promise<AxiosResponse<ProfileDTO>> {
		return this.axiosInstance.post('/create', { nickname });
	}

	public async uploadAvatarImage(formData: FormData): Promise<AxiosResponse<ProfileDTO>> {
		return this.axiosInstance.post('/avatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	}

	public async updateProfile(profile: Partial<ProfileDTO>): Promise<AxiosResponse<ProfileDTO>> {
		return this.axiosInstance.put('', profile);
	}

	public async deleteAccount(): Promise<AxiosResponse<ProfileDeletedResponseDto>> {
		return this.axiosInstance.delete('');
	}

	public async getPublicProfile(id: string): Promise<AxiosResponse<ProfileDTO>> {
		return this.axiosInstance.get(`public/${id}`);
	}

	public async readAllUsers(): Promise<AxiosResponse> {
		return this, this.axiosInstance.get('profiles');
	}

	public async addFriend(id: string): Promise<AxiosResponse<SimpleProfileDto>> {
		return this.axiosInstance.post(`friend/${id}`);
	}

	public async deleteFriend(id: string): Promise<AxiosResponse<ProfileDeletedResponseDto>> {
		return this.axiosInstance.delete(`friend/${id}`);
	}

	public async getFriends(): Promise<AxiosResponse<SimpleProfileDto[]>> {
		return this.axiosInstance.get(`friends`);
	}

	public async getFriendBy(): Promise<SimpleProfileDto[]> {
		return this.axiosInstance.get(`friend-by`);
	}

	public async blockUser(id: string): Promise<AxiosResponse<SimpleProfileDto>> {
		return this.axiosInstance.post(`block/${id}`);
	}

	public async unblockUser(id: string): Promise<AxiosResponse<ProfileDeletedResponseDto>> {
		return this.axiosInstance.delete(`block/${id}`);
	}

	public async getBlockedUsers(): Promise<AxiosResponse<SimpleProfileDto[]>> {
		return this.axiosInstance.get(`blocks`);
	}

	public async getBlockedBy(): Promise<SimpleProfileDto[]> {
		return this.axiosInstance.get(`blocked-by`);
	}
}

export const profileService: ProfileService = new ProfileService(
	'http://localhost:3000/api/profile'
);
