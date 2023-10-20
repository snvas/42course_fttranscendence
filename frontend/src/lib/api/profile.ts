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

export async function getPublicProfile(userId: string): Promise<AxiosResponse<ProfileDTO> | null> {
	try {
		let p = await profileService.getPublicProfile(userId);
		return p;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.response?.status == 404) {
				goto('/404.html');
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

export async function getAvatarFromId(
	avatarId: number | null
): Promise<AxiosResponse<Blob> | null> {
	if (avatarId == null) return null;
	try {
		let image = await profileService.getAvatarImage(avatarId);
		return image;
	} catch {
		return null;
	}
}

export async function readAllUsers() {
	try {
		let u: AxiosResponse<ProfileDTO[]> = await profileService.readAllUsers();
		return u.data;
	} catch {
		return [];
	}
}
