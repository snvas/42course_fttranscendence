<script lang="ts">
	import DirectMessages from '$lib/components/chat/DirectMessages.svelte';
	import { socket, selectedDirect, profile, onlineUsers, playersStatus } from '$lib/stores';
	import { onDestroy } from 'svelte';
	import DirectList from '$lib/components/chat/DirectList.svelte';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import chatService from '$lib/api/services/ChatService';
	import type {
		PrivateMessageDto,
		ConversationDto,
		MessageProfileDto,
		PlayerStatusDto,
		PrivateMessageHistoryDto,
		ComponentMessage
	} from '$lib/dtos';
	import { getPrivateMessageHistory } from '$lib/api';
	import { v4 as uuidV4 } from 'uuid';
	import { parseISO } from 'date-fns';
	import { socketEvent } from '$lib/api/services/SocketsEvents';

	let messages: ComponentMessage[] | null = null;
	let selectedHistory: PrivateMessageHistoryDto | null = null;

	let privateMessageHistory: PrivateMessageHistoryDto[] = [];

	let historyList: PlayerStatusDto[];

	let loading = getPrivateMessageHistory();

	loading.then((history) => {
		if (history) {
			privateMessageHistory = history;
			setSelectedMessages($selectedDirect);
		}
	});

	function onSelectChat(historyId: number) {
		setSelectedHistory(historyId);
		$selectedDirect = selectedHistory ?? null;
		setSelectedMessages(selectedHistory);
	}

	function setSelectedMessages(user: MessageProfileDto | null) {
		if (!user) {
			setMessagesFromHistory(null);

			return;
		}
		let selected = privateMessageHistory.find((v) => v.id === user.id);
		if (selected) {
			setMessagesFromHistory(selected);
		} else {
			let newHistory = { ...user, messages: [] };
			privateMessageHistory = [...privateMessageHistory, newHistory];
			setMessagesFromHistory(newHistory);
		}
	}

	function setSelectedHistory(userId: number) {
		selectedHistory =
			privateMessageHistory.find((v) => {
				return v.id === userId;
			}) ?? null;
	}

	function setMessagesFromHistory(history: PrivateMessageHistoryDto | null) {
		messages =
			history?.messages.map((message: ConversationDto): ComponentMessage => {
				return {
					message: message.message,
					createdAt: new Date(message.createdAt).toISOString(),
					nickname: message.sender.nickname == $profile.nickname ? 'me' : message.sender.nickname,
					uuid: uuidV4(),
					sync: true
				};
			}) ?? null;
		selectedHistory = history;
	}

	const onPrivateMessage = (message: PrivateMessageDto): void => {
		console.log(`### received private ${message.message}`);
		if (
			!privateMessageHistory.find(
				(history: PrivateMessageHistoryDto): boolean => history.id === message.sender.id
			)
		) {
			const newHistory: PrivateMessageHistoryDto[] = privateMessageHistory;

			console.log(`### prev history: ${JSON.stringify(privateMessageHistory)}`);
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

			privateMessageHistory = newHistory;
		} else {
			privateMessageHistory = privateMessageHistory.map(
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
		setMessagesFromHistory(selectedHistory);
	};

	async function sendPrivateMessage(message: string) {
		if (!$selectedDirect) return;

		const messageDate: string = new Date().toISOString();
		const messageUUID: string = uuidV4();

		const componentMessage: ComponentMessage = {
			message: message,
			createdAt: messageDate,
			nickname: 'me',
			uuid: messageUUID,
			sync: false
		};

		// TODO: online vai se tornar todos os usuários
		let receiver: PlayerStatusDto | undefined = $onlineUsers.find(
			(playerStatus: PlayerStatusDto): boolean => {
				return playerStatus.nickname === $selectedDirect!.nickname;
			}
		);

		if (!receiver) {
			const receiverHistory: PrivateMessageHistoryDto | undefined = privateMessageHistory.find(
				(m: PrivateMessageHistoryDto): boolean => {
					return m.nickname === $selectedDirect!.nickname;
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

		messages = [...(messages ?? []), componentMessage];

		const privateMessage: PrivateMessageDto = {
			message,
			receiver: {
				id: receiver.id,
				nickname: receiver.nickname
			},
			sender: {
				id: $profile.id,
				nickname: $profile.nickname
			},
			createdAt: parseISO(messageDate)
		};

		let backendMessage = await chatService.emitPrivateMessage(privateMessage);

		if (!backendMessage) {
			console.log('Error when sending private message');
			return;
		}
		const newHistory: PrivateMessageHistoryDto[] = privateMessageHistory.map(
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

		privateMessageHistory = newHistory;
		setMessagesFromHistory(selectedHistory);
		console.log(`Private message sent: ${JSON.stringify(backendMessage)}`);
	}

	$socket.on(socketEvent.RECEIVE_PRIVATE_MESSAGE, onPrivateMessage);

	function getHistoryFromStatus(
		history: PrivateMessageHistoryDto[],
		playerStatus: PlayerStatusDto[]
	): PlayerStatusDto[] {
		if (playerStatus.length == 0) return [];
		let list: PlayerStatusDto[] = history.map((hist) => {
			// console.log(playerStatus);
			return playerStatus.find((usr) => usr.id == hist.id)!;
		});
		return list;
	}

	$: historyList = getHistoryFromStatus(privateMessageHistory, $playersStatus);

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});

	// $: console.log(historyList);
	// $: console.log(privateMessageHistory);
	// $: console.log($playersStatus);
</script>

<ChatLayout selected="direct">
	<div class="contents" slot="list">
		<DirectList
			{historyList}
			on:select={(e) => {
				onSelectChat(e.detail);
			}}
		/>
	</div>

	<div class="contents" slot="messages">
		<DirectMessages bind:messages sendMessage={sendPrivateMessage} />
	</div>
</ChatLayout>
