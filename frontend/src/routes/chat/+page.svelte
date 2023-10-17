<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import DirectMessages from '$lib/components/DirectMessages.svelte';
	import GroupMessages from '$lib/components/GroupMessages.svelte';
	import { useAuth, socket, selectedDirect } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { getContext, onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import chatService from '$lib/api/services/ChatService';
	import type {
		ConversationDto,
		MessageProfileDto,
		PlayerStatusDto,
		PrivateMessageDto,
		PrivateMessageHistoryDto
	} from '$lib/dtos';
	import AvatarImage from '$lib/components/AvatarImage.svelte';
	import { getAvatarFromId } from '$lib/api';
	import UsersList from '$lib/components/UsersList.svelte';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	function showDirect(historyId: number) {
		selectedHistory =
			privateMessageHistory.find((v) => {
				return v.id === historyId;
			}) ?? null;
		$selectedDirect = selectedHistory ?? null;
	}

	// function showGroup(index: number) {
	// 	// TODO: trocar index pelo id do user e requisitar o dado do backend
	// 	selectedGroup = groupsData[index];
	// }

	$: selectedHistory = getSelectedHistory($selectedDirect);

	let panel: 'direct' | 'groups' | 'create-group' = 'direct';

	$socket.connect();

	let privateMessageHistory: PrivateMessageHistoryDto[] = [];
	let playersStatus: PlayerStatusDto[] = [];
	let messages: ConversationDto[] = [];

	function getSelectedHistory(
		user: MessageProfileDto | null
	): PrivateMessageHistoryDto | null {
		if (!user) {
			return null;
		}
		let selected = privateMessageHistory.find((v) => v.id === user.id);
		if (selected) {
			return selected;
		}
		let newHistory = { ...user, messages: [] };
		privateMessageHistory = [...privateMessageHistory, newHistory];
		return newHistory;
	}

	const onConnect = (): void => {
		console.log('### connected to server via websocket');
	};

	const onException = (message: string): void => {
		console.log(`### received error message ${JSON.stringify(message)}`);
		throw message;
	};

	const onUnauthorized = (message: string): void => {
		console.log(`### received unauthorized message ${JSON.stringify(message)}`);
		$socket.disconnect();
		goto('/login');
	};

	const onMessage = (msg: ConversationDto): void => {
		console.log(`### received chat message ${JSON.stringify(msg)}`);

		messages = [...messages, msg];
	};

	const onPrivateMessage = (message: PrivateMessageDto): void => {
		console.log(
			`### received private ${message.message} message id: ${
				message.sender.id
			} | history ids: ${JSON.stringify(
				privateMessageHistory.map((h: PrivateMessageHistoryDto) => h.id)
			)}`
		);

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
	};

	const onPlayersStatus = (onlineUsers: PlayerStatusDto[]): void => {
		console.log(`### received online users ${JSON.stringify(onlineUsers)}`);

		playersStatus = onlineUsers;
	};

	$socket.on('connect', onConnect);
	$socket.on('exception', onException);
	$socket.on('unauthorized', onUnauthorized);
	$socket.on('message', onMessage);
	$socket.on('receivePrivateMessage', onPrivateMessage);
	$socket.on('playersStatus', onPlayersStatus);

	onDestroy(() => {
		$socket.off('connect');
		$socket.off('error');
		$socket.off('message');
		$socket.off('receivePrivateMessage');
		$socket.off('playersStatus');
		$socket.disconnect();
	});

	$: console.log($selectedDirect);
	$: console.log(privateMessageHistory);
</script>

<div class="h-full min-h-screen w-screen flex flex-col md:h-screen gap-10">
	<div class="flex-none">
		<PongHeader />
	</div>
	<div class="flex flex-col justify-end items-end">
		<a href="/dashboard">
			<i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" />
		</a>
	</div>
	<div class="flex flex-col md:flex-row gap-10 p-10 h-full">
		<div class="gap-15 flex flex-col md:w-1/4 flex-none w-full h-full">
			<div class="border-4 border-white min-w-fit w-full flex flex-col h-full rounded-3xl">
				<div class="flex-none flex flex-row gap-4 px-4 py-2">
					<!-- TODO: padronizar botões e estilo baseado na variável "showingMessages" -->
					<button
						class="border-2 border-white h-10 flex-1 items-center justify-center rounded-xl"
						on:click={() => {
							panel = 'direct';
						}}
					>
						<p class="text-center">Direct Messages</p>
					</button>
					<button
						class="border-2 border-white h-10 flex-1 items-center justify-center rounded-xl"
						on:click={() => {
							panel = 'groups';
						}}
					>
						<p class="">Groups</p>
					</button>
				</div>
				{#if panel == 'direct'}
					<div class="h-full w-full flex flex-col">
						{#each privateMessageHistory as history}
							<button
								on:click={() => showDirect(history.id)}
								class="border-b-2 border-x-white h-12 m-2 flex flex-row"
							>
								<!-- <img
								class="avatar max-w-sm aspect-square w-10 h-10 m-2"
								src={history.avatarId}
								alt={history.nickname}
								title={history.nickname}
							/>
							<AvatarImage ></AvatarImage> -->
								<div class="flex flex-col ml-3">
									<p class="flex flex-col">{history.nickname}</p>
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="h-full w-full flex flex-col">
						<!-- {#each groupsPreview as group, i}
							<button
								on:click={() => showGroup(i)}
								class="p-2 border-b border-gray-800 border-x-white flex flex-row bg-yellow-500 bg-opacity-0 hover:bg-opacity-10"
							>
								<div class="flex flex-col ml-3 w-full items-start">
									<div class="flex flex-row justify-between w-full">
										<p class="flex flex-col">{group.name}</p>
										<p class=" text-gray-600 font-extralight">
											{group.visibility}
										</p>
									</div>
								</div>
							</button>
						{/each} -->
					</div>
					{#if panel == 'groups'}
						<div class="p-2">
							<button class="btn-primary" on:click={() => (panel = 'create-group')}>
								Create Group
							</button>
						</div>
					{/if}
				{/if}
			</div>
		</div>
		<div class="flex flex-col w-full h-full">
			{#if panel == 'direct'}
				<DirectMessages bind:direct={selectedHistory} />
			{:else if panel == 'groups'}
				<!-- <GroupMessages bind:group={selectedGroup} /> -->
			{:else}
				create group
			{/if}
		</div>
	</div>
</div>

<style>
	.icon-link {
		color: whitesmoke;
	}
</style>
