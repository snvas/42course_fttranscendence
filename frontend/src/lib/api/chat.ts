import type { AxiosResponse } from 'axios';
import type { PrivateMessageHistoryDto } from '$lib/dtos';
import chatService from './services/ChatService';

export async function getPrivateMessageHistory(): Promise<PrivateMessageHistoryDto[] | undefined> {
	try {
		const response: AxiosResponse<PrivateMessageHistoryDto[]> =
			await chatService.getPrivateMessageHistory();

		return response.data;
	} catch (error) {
		throw error;
	}
}
