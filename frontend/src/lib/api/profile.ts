import { AxiosError, type AxiosResponse } from 'axios';
import type { ProfileDTO } from '$lib/dtos';
import { goto } from '$app/navigation';
import { profileService } from '$lib/api';

export async function getProfile(): Promise<AxiosResponse<ProfileDTO> | null> {
	try {
		let p = await profileService.getProfile();
		return p;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.response?.status == 404) {
				goto('/welcome');
			} else {
				goto('/login');
			}
		}
		return null;
	}
}

export async function getUserAvatar(profilePromise: Promise<AxiosResponse<ProfileDTO> | null>) {
	try {
		let profile = await profilePromise;
		if (!profile?.data?.avatarId) throw new Error();
		let image = await profileService.getAvatarImage(profile.data.avatarId);
		return image;
	} catch {
		return null;
	}
}