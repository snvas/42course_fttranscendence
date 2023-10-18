import chatService from '$lib/api/services/ChatService';
import type {
	PrivateMessageDto,
	ConversationDto,
	MessageProfileDto,
	PlayerStatusDto,
	PrivateMessageHistoryDto,
	ComponentMessage,
	ProfileDTO
} from '$lib/dtos';
import { getPrivateMessageHistory } from '$lib/api';
import { v4 as uuidV4 } from 'uuid';
import { parseISO } from 'date-fns';

export class PrivateChatHandler {
	public privateMessageHistory: PrivateMessageHistoryDto[] = [];
	public selectedHistory: PrivateMessageHistoryDto | null = null;
	public messages: ComponentMessage[] | null = [];
	public loading: Promise<PrivateMessageHistoryDto[] | undefined>;
	public ackSendMessage: Promise<PrivateMessageDto> | null = null;

	constructor() {
		this.loading = getPrivateMessageHistory();

		this.loading.then((history) => {
			if (history) {
				this.privateMessageHistory = history;
			}
		});
	}

	public recieveMessage(message: PrivateMessageDto, profile: ProfileDTO): void {
		if (
			!this.privateMessageHistory.find(
				(history: PrivateMessageHistoryDto): boolean => history.id === message.sender.id
			)
		) {
			const newHistory: PrivateMessageHistoryDto[] = this.privateMessageHistory;

			console.log(`### prev history: ${JSON.stringify(this.privateMessageHistory)}`);
			newHistory.push({
				id: message.sender.id,
				nickname: message.sender.nickname,
				messages: [
					{
						id: message.id,
						message: message.message,
						sender: {
							id: message.sender.id,
							nickname: message.sender.nickname
						},
						createdAt: message.createdAt
					}
				]
			});

			console.log(`### new history: ${JSON.stringify(newHistory)}`);

			this.privateMessageHistory = newHistory;
		} else {
			this.privateMessageHistory = this.privateMessageHistory.map(
				(history: PrivateMessageHistoryDto): PrivateMessageHistoryDto => {
					if (history.id === message.sender.id) {
						if (history.messages.find((m: ConversationDto): boolean => m.id === message.id)) {
							return history;
						}

						history.messages.push({
							id: message.id,
							message: message.message,
							sender: {
								id: message.sender.id,
								nickname: message.sender.nickname
							},
							createdAt: message.createdAt
						});
					}
					return history;
				}
			);
		}
		this.setMessagesFromHistory(this.selectedHistory, profile);
	}

	public async sendMessage(
		message: string,
		playersStatus: PlayerStatusDto[],
		user: MessageProfileDto,
		profile: ProfileDTO
	) {
		const messageDate: string = new Date().toISOString();
		const messageUUID: string = uuidV4();

		const componentMessage: ComponentMessage = {
			message: message,
			createdAt: messageDate,
			nickname: 'me',
			uuid: messageUUID,
			sync: false
		};

		let receiver: PlayerStatusDto | undefined = playersStatus.find(
			(playerStatus: PlayerStatusDto): boolean => {
				return playerStatus.nickname === user.nickname;
			}
		);

		if (!receiver) {
			const receiverHistory: PrivateMessageHistoryDto | undefined = this.privateMessageHistory.find(
				(m: PrivateMessageHistoryDto): boolean => {
					return m.nickname === user.nickname;
				}
			);
			if (!receiverHistory) {
				console.log('Receiver not found');
				return;
			}
			receiver = {
				id: receiverHistory.id,
				nickname: receiverHistory.nickname,
				status: 'offline'
			};
		}

		if (!profile) {
			console.log('Profile not found');
			return;
		}

		this.messages = [...(this.messages ?? []), componentMessage];

		const privateMessage: PrivateMessageDto = {
			message,
			receiver: {
				id: receiver.id,
				nickname: receiver.nickname
			},
			sender: {
				id: profile.id,
				nickname: profile.nickname
			},
			createdAt: parseISO(messageDate)
		};

		this.ackSendMessage = chatService.emitPrivateMessage(privateMessage);
	}

	public async confirmSendMessage(profile: ProfileDTO) {
		let backendMessage = await this.ackSendMessage;

		if (!backendMessage) {
			console.log('Error when sending private message');
			return;
		}
		const newHistory: PrivateMessageHistoryDto[] = this.privateMessageHistory.map(
			(history: PrivateMessageHistoryDto): PrivateMessageHistoryDto => {
				if (history.id != backendMessage!.receiver.id) {
					return history;
				}

				if (history.messages.find((m: ConversationDto): boolean => m.id === backendMessage!.id)) {
					return history;
				}

				history.messages.push({
					id: backendMessage!.id,
					message: backendMessage!.message,
					sender: backendMessage!.sender,
					createdAt: backendMessage!.createdAt
				});

				return history;
			}
		);

		this.privateMessageHistory = newHistory;
		this.setMessagesFromHistory(this.selectedHistory, profile);
		console.log(`Private message sent: ${JSON.stringify(backendMessage)}`);
	}

	private setMessagesFromHistory(history: PrivateMessageHistoryDto | null, profile: ProfileDTO) {
		this.messages =
			history?.messages.map((message: ConversationDto): ComponentMessage => {
				return {
					message: message.message,
					createdAt: new Date(message.createdAt).toISOString(),
					nickname: message.sender.nickname == profile.nickname ? 'me' : message.sender.nickname,
					uuid: uuidV4(),
					sync: true
				};
			}) ?? null;
		this.selectedHistory = history;
	}

	public setSelectedMessages(user: MessageProfileDto | null, profile: ProfileDTO) {
		if (!user) {
			this.setMessagesFromHistory(null, profile );

			return;
		}
		let selected = this.privateMessageHistory.find((v) => v.id === user.id);
		if (selected) {
			this.setMessagesFromHistory(selected, profile);
		} else {
			let newHistory = { ...user, messages: [] };
			this.privateMessageHistory = [...this.privateMessageHistory, newHistory];
			this.setMessagesFromHistory(newHistory, profile);
		}
	}

	public setSelectedHistory(userId: number, profile: ProfileDTO) {
		this.selectedHistory =
			this.privateMessageHistory.find((v) => {
				return v.id === userId;
			}) ?? null;
		this.setSelectedMessages(this.selectedHistory, profile);
	}
}
