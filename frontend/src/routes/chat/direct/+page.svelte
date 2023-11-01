<script lang="ts">
	import DirectMessages from '$lib/components/chat/DirectMessages.svelte';
	import {
		onlineUsers,
		selectedDirect,
		socket,
		profile,
		playersStatus,
		friendsList,
		blockList
	} from '$lib/stores';
	import { onDestroy } from 'svelte';
	import DirectList from '$lib/components/chat/DirectList.svelte';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import type {
		ComponentMessage,
		DashboardUsersList,
		MessageConversationDto,
		MessageProfileDto,
		PlayerStatusDto,
		PrivateMessageDto,
		PrivateMessageHistoryDto
	} from '$lib/dtos';
	import {
		getPrivateMessageHistory,
		addFriend,
		deleteFriend,
		blockUser,
		unblockUser,
		chatService
	} from '$lib/api';
	import { parseISO } from 'date-fns';
	import { socketEvent } from '$lib/api/services/SocketsEvents';
	import { goto } from '$app/navigation';

	//  [ ]: verificar se socket está conectado antes de conectar de novo
	$socket.connect();

	let messages: ComponentMessage[] | null = null;
	let selectedHistory: PrivateMessageHistoryDto | null = null;

	let privateMessageHistory: PrivateMessageHistoryDto[] = [];

	let historyList: DashboardUsersList[];

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
			history?.messages.map((message: MessageConversationDto): ComponentMessage => {
				return {
					message: message.message,
					createdAt: new Date(message.createdAt).toISOString(),
					nickname: message.sender.nickname == $profile.nickname ? 'me' : message.sender.nickname,
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
						if (
							history.messages.find((m: MessageConversationDto): boolean => m.id === message.id)
						) {
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

		const componentMessage: ComponentMessage = {
			message: message,
			createdAt: messageDate,
			nickname: 'me',
			sync: false
		};

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

				if (
					history.messages.find((m: MessageConversationDto): boolean => m.id === backendMessage!.id)
				) {
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
		playerStatus: DashboardUsersList[]
	): DashboardUsersList[] {
		if (playerStatus.length == 0) return [];
		let list: DashboardUsersList[] = history.map((hist) => {
			// console.log(playerStatus);
			return playerStatus.find((usr) => usr.id == hist.id)!;
		});
		return list;
	}

	$: historyList = getHistoryFromStatus(privateMessageHistory, $playersStatus);

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});

	// TODO: entrar ou convidar o usuário para jogar 
	async function onGame() {
		goto('/game');
	}

	async function onFriend(userId: number) {
		let res = await addFriend(userId);
		if (typeof res !== 'number') {
			if (!$friendsList.find((v) => v.id == userId)) {
				$friendsList.push(res);
				$friendsList = $friendsList;
			}
		}
		console.log(res);
	}

	async function onUnfriend(userId: number) {
		let res = await deleteFriend(userId);
		if (res == true) {
			$friendsList = $friendsList.filter((v) => v.id != userId);
		}
	}

	async function onBlock(userId: number) {
		let res = await blockUser(userId);
		if (typeof res !== 'number') {
			if (!$blockList.find((v) => v.id == userId)) {
				$blockList.push(res);
				$blockList = $blockList;
			}
		}
		console.log(res);
	}

	async function onUnblock(userId: number) {
		let res = await unblockUser(userId);
		if (res == true) {
			$blockList = $blockList.filter((v) => v.id != userId);
		}
	}

	// $: console.log(historyList);
	// $: console.log(privateMessageHistory);
	// $: console.log($playersStatus);
</script>

<ChatLayout selected="direct">
	<div class="contents" slot="list">
		<DirectList
			{historyList}
			on:select={(e) => onSelectChat(e.detail)}
			on:friend={(e) => onFriend(e.detail)}
			on:unfriend={(e) => onUnfriend(e.detail)}
			on:block={(e) => onBlock(e.detail)}
			on:unblock={(e) => onUnblock(e.detail)}
			on:profile={(e) => goto(`/public/${e.detail}`)}
		/>
	</div>

	<div class="contents" slot="messages">
		<DirectMessages bind:messages sendMessage={sendPrivateMessage} />
	</div>
</ChatLayout>
