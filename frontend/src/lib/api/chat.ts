import { isAxiosError, type AxiosResponse } from 'axios';
import type {
	GroupChatDto,
	GroupChatHistoryDto,
	GroupMemberDto,
	PrivateMessageHistoryDto
} from '$lib/dtos';
import { chatService } from './services/ChatService';

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
		throw error;
	}
}

export async function readChatHistory(): Promise<GroupChatHistoryDto[]> {
	try {
		const response = await chatService.getGroupMessageHistory();
		return response.data;
	} catch (error) {
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
		let response = await chatService.leaveGroupChat(groupId);
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
		let response = await chatService.addGroupChatUser(groupId, profileId);
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
		let response = await chatService.kickGroupChatMember(groupId, profileId);
		return response.data.affected;
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			return error.response.status;
		}
		throw error;
	}
}
