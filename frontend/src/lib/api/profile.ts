import { AxiosError, isAxiosError, type AxiosResponse } from 'axios';
import type { ProfileDTO, ProfileDeletedResponseDto, SimpleProfileDto } from '$lib/dtos';
import { goto } from '$app/navigation';
import { profileService } from '$lib/api';
import { verifyUnautorized } from '$lib/utils';

export async function getProfile(): Promise<AxiosResponse<ProfileDTO> | null> {
	try {
		const p = await profileService.getProfile();
		return p;
	} catch (error) {
		verifyUnautorized(error);
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
		const p = await profileService.getPublicProfile(userId);
		return p;
	} catch (error) {
		verifyUnautorized(error);
		if (error instanceof AxiosError) {
			if (error.response?.status == 404) {
				goto('/404');
			}
		}
		return null;
	}
}

export async function getFriendsPublic(userId: string): Promise<AxiosResponse<SimpleProfileDto[]> | null> {
	try {
		const p = await profileService.getPublicFriends(userId);
		return p;
	} catch (error) {
		verifyUnautorized(error);
		return null;
	}
}

export async function getUserAvatar(profilePromise: Promise<AxiosResponse<ProfileDTO> | null>) {
	try {
		const profile = await profilePromise;
		if (!profile?.data?.avatarId) throw new Error();
		const image = await profileService.getAvatarImage(profile.data.avatarId);
		return image;
	} catch (error) {
		verifyUnautorized(error);
		return null;
	}
}

export async function getAvatarFromId(
	avatarId: number | null
): Promise<AxiosResponse<Blob> | null> {
	if (avatarId == null) return null;
	try {
		const image = await profileService.getAvatarImage(avatarId);
		return image;
	} catch (error) {
		verifyUnautorized(error);
		return null;
	}
}

export async function readAllUsers() {
	try {
		const u: AxiosResponse<ProfileDTO[]> = await profileService.readAllUsers();
		return u.data;
	} catch (error) {
		verifyUnautorized(error);
		return [];
	}
}

export async function readFriends() {
	try {
		const friends: AxiosResponse<SimpleProfileDto[]> = await profileService.getFriends();
		return friends.data;
	} catch (error) {
		verifyUnautorized(error);
		return [];
	}
}

export async function addFriend(userId: number) {
	try {
		const newFriend: AxiosResponse<SimpleProfileDto> = await profileService.addFriend(`${userId}`);
		return newFriend.data;
	} catch (error) {
		if (verifyUnautorized(error)) return;
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function deleteFriend(userId: number): Promise<boolean | number> {
	try {
		const res: AxiosResponse<ProfileDeletedResponseDto> = await profileService.deleteFriend(
			`${userId}`
		);
		return res.data.deleted;
	} catch (error) {
		verifyUnautorized(error);
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function blockUser(userId: number): Promise<SimpleProfileDto | number> {
	try {
		const res: AxiosResponse<SimpleProfileDto> = await profileService.blockUser(`${userId}`);
		return res.data;
	} catch (error) {
		verifyUnautorized(error);
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function readBlockeds() {
	try {
		const blockeds: AxiosResponse<SimpleProfileDto[]> = await profileService.getBlockedUsers();
		return blockeds.data;
	} catch (error) {
		verifyUnautorized(error);
		return [];
	}
}

export async function unblockUser(userId: number): Promise<boolean | number> {
	try {
		const res: AxiosResponse<ProfileDeletedResponseDto> = await profileService.unblockUser(
			`${userId}`
		);
		return res.data.deleted;
	} catch (error) {
		verifyUnautorized(error);
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function blockedBy(userId: number): Promise<boolean> {
	try {
		let blockedByList = await profileService.getBlockedBy();
		console.log('blockedByList', blockedByList);
		return blockedByList.data.find((v) => v.id == userId) ? true : false;
	} catch (e) {
		verifyUnautorized(e);
		throw e;
	}
}

export async function readBlockedBy(): Promise<SimpleProfileDto[]> {
	try {
		let blockedByList = await profileService.getBlockedBy();
		return blockedByList.data;
	} catch (error) {
		verifyUnautorized(error);
		return [];
	}
}
