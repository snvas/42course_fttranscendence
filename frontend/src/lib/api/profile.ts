import { AxiosError, isAxiosError, type AxiosResponse } from 'axios';
import type { ProfileDTO, ProfileDeletedResponseDto, SimpleProfileDto } from '$lib/dtos';
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

export async function readFriends() {
	try {
		let friends: AxiosResponse<SimpleProfileDto[]> = await profileService.getFriends();
		return friends.data;
	} catch (error) {
		return [];
	}
}

export async function addFriend(userId: number) {
	try {
		let newFriend: AxiosResponse<SimpleProfileDto> = await profileService.addFriend(`${userId}`);
		return newFriend.data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function deleteFriend(userId: number): Promise<boolean | number> {
	try {
		let res: AxiosResponse<ProfileDeletedResponseDto> = await profileService.deleteFriend(
			`${userId}`
		);
		return res.data.deleted;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function blockUser(userId: number): Promise<SimpleProfileDto | number> {
	try {
		let res: AxiosResponse<SimpleProfileDto> = await profileService.blockUser(`${userId}`);
		return res.data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function readBlockeds() {
	try {
		let blockeds: AxiosResponse<SimpleProfileDto[]> = await profileService.getBlockedUsers();
		return blockeds.data;
	} catch (error) {
		return [];
	}
}

export async function unblockUser(userId: number): Promise<boolean | number> {
	try {
		let res: AxiosResponse<ProfileDeletedResponseDto> = await profileService.unblockUser(
			`${userId}`
		);
		return res.data.deleted;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}
