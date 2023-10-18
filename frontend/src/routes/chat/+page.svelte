<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import DirectMessages from '$lib/components/DirectMessages.svelte';
	import { useAuth, socket, selectedDirect, profile, onlineUsers } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type { PrivateMessageDto, PrivateMessageHistoryDto, ComponentMessage } from '$lib/dtos';
	import { PrivateChatHandler } from '$lib/privateChatHandler';
	import { getAvatarFromId } from '$lib/api';
	import AvatarImage from '$lib/components/AvatarImage.svelte';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	let panel: 'direct' | 'groups' | 'create-group' = 'direct';

	let messages: ComponentMessage[] | null = null;

	/*
 	PrivateHandlers 
	*/

	let privateMessageHistory: PrivateMessageHistoryDto[] = [];
	let privateChatHandler = new PrivateChatHandler($profile);

	function onSelectUserChat(historyId: number) {
		privateChatHandler.setSelectedHistory(historyId);
		$selectedDirect = privateChatHandler.selectedHistory ?? null;
		updatePrivateVariables();
	}

	function updatePrivateVariables() {
		messages = privateChatHandler.messages;
		privateMessageHistory = privateChatHandler.privateMessageHistory;
	}

	privateChatHandler.loading.then((history) => {
		privateChatHandler.setSelectedMessages($selectedDirect);
		updatePrivateVariables();
		console.log(history);
	});

	const onPrivateMessage = (message: PrivateMessageDto): void => {
		console.log(`### received private ${message.message}`);
		privateChatHandler.recieveMessage(message);
		updatePrivateVariables();
	};

	async function sendPrivateMessage(message: string) {
		if (!$selectedDirect) return;
		privateChatHandler.sendMessage(message, $onlineUsers, $selectedDirect);
		updatePrivateVariables();
		await privateChatHandler.confirmSendMessage();
		updatePrivateVariables();
	}

	/*
 	GroupHandlers 
	*/

	// function showGroup(index: number) {
	// 	// TODO: trocar index pelo id do user e requisitar o dado do backend
	// 	selectedGroup = groupsData[index];
	// }

	/*
 	Sockets 
	*/
	$socket.on('receivePrivateMessage', onPrivateMessage);

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});
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
								on:click={() => onSelectUserChat(history.id)}
								class="border-b-2 border-x-white h-12 m-2 flex flex-row"
							>
								<div class="h-10 w-10">
									<AvatarImage avatar={getAvatarFromId(history.avatarId ?? null)} />
								</div>
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
				<DirectMessages bind:messages sendMessage={sendPrivateMessage} />
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
