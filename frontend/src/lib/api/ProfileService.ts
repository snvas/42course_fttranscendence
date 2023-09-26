import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ProfileDTO } from '../../../../backend/src/profile/models/profile.dto.ts';
import type { ProfileDeletedResponseDto } from '../../../../backend/src/profile/models/profile-delete-response.dto.ts';

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
}

export const profileService: ProfileService = new ProfileService('http://localhost:3000/api/profile');
