import { isAxiosError, type AxiosResponse } from 'axios';
import type {
	GroupChatDto,
	GroupChatHistoryDto,
	GroupMemberDto,
	PrivateMessageHistoryDto
} from '$lib/dtos';
import { chatService } from './services/ChatService';
import { verifyUnautorized } from '$lib/utils';

export async function getPrivateMessageHistory(): Promise<PrivateMessageHistoryDto[] | undefined> {
	try {
		const response: AxiosResponse<PrivateMessageHistoryDto[]> =
			await chatService.getPrivateMessageHistory();
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function readAllGroupChats(): Promise<GroupChatDto[]> {
	try {
		const response: AxiosResponse<GroupChatDto[]> = await chatService.getAllGroupChats();
		return response.data;
	} catch (error) {
		if (verifyUnautorized(error)) return [];
		throw error;
	}
}

export async function readChatHistory(): Promise<GroupChatHistoryDto[]> {
	try {
		const response = await chatService.getGroupMessageHistory();
		return response.data;
	} catch (error) {
		if (verifyUnautorized(error)) return [];
		throw error;
	}
}

export async function joinGroupChat(groupId: number, password?: string): Promise<void | number> {
	try {
		let response;
		if (password) {
			response = await chatService.joinGroupChat(groupId, { password });
		} else {
			response = await chatService.joinGroupChat(groupId);
		}
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function leaveGroupChat(groupId: number): Promise<void | number> {
	try {
		const response = await chatService.leaveGroupChat(groupId);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function addGroupChatUser(
	groupId: number,
	profileId: number
): Promise<GroupMemberDto | number> {
	try {
		const response = await chatService.addGroupChatUser(groupId, profileId);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function kickGroupChatUser(
	groupId: number,
	profileId: number
): Promise<boolean | number> {
	try {
		await chatService.kickGroupChatMember(groupId, profileId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.data;
		}
		throw error;
	}
}

export async function muteGroupChatMember(
	groupId: number,
	profileId: number
): Promise<boolean | number> {
	try {
		await chatService.muteGroupChatMember(groupId, profileId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function unmuteGroupChatMember(
	groupId: number,
	profileId: number
): Promise<boolean | number> {
	try {
		await chatService.unmuteGroupChatMember(groupId, profileId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function updateGroupChatPassword(chatId: number, password: string): Promise<boolean> {
	try {
		await chatService.updateGroupChatPassword(chatId, password);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return false;
		}
		throw error;
	}
}

export async function updateGroupChatMemberRole(
	chatId: number,
	profileId: number,
	role: string
): Promise<boolean | number> {
	try {
		let res = await chatService.updateGroupChatMemberRole(chatId, profileId, role);
		return res.data.updated;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return false;
		}
		throw error;
	}
}

export async function deleteGroupChatPassword(chatId: number): Promise<boolean> {
	try {
		await chatService.deleteGroupChatPassword(chatId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return false;
		}
		throw error;
	}
}

export async function deleteGroupChatById(chatId: number): Promise<number | boolean> {
	try {
		await chatService.deleteGroupChat(chatId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function banGroupChatMember(
	groupId: number,
	profileId: number
): Promise<boolean | number> {
	try {
		await chatService.banGroupChatMember(groupId, profileId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}

export async function unbunGroupChatMember(
	groupId: number,
	profileId: number
): Promise<boolean | number> {
	try {
		await chatService.unbanGroupChatMember(groupId, profileId);
		return true;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}
