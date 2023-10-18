<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import DirectMessages from '$lib/components/chat/DirectMessages.svelte';
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { useAuth, socket, selectedDirect, profile, onlineUsers } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type { PrivateMessageDto, PrivateMessageHistoryDto, ComponentMessage } from '$lib/dtos';
	import { PrivateChatHandler } from '$lib/privateChatHandler';
	import { getAvatarFromId, getProfile } from '$lib/api';
	import DirectList from '$lib/components/chat/DirectList.svelte';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import AvatarImage from '$lib/components/AvatarImage.svelte';

	let messages: ComponentMessage[] | null = null;

	/*
 	PrivateHandlers 
	*/

	let groupMessageHistory: PrivateMessageHistoryDto[] = [];
	let privateChatHandler = new PrivateChatHandler();

	function onSelectChat(historyId: number) {
		privateChatHandler.setSelectedHistory(historyId, $profile);
		$selectedDirect = privateChatHandler.selectedHistory ?? null;
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
	// $socket.on('receivePrivateMessage', onPrivateMessage);

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});
</script>

<ChatLayout>
	<div class="contents" slot="list">
		<div class="h-full w-full flex flex-col">
			{#each groupMessageHistory as history}
				<button
					on:click={() => onSelectChat(history.id)}
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
	</div>

	<div class="contents" slot="messages">
		<GroupMessages bind:messages />
	</div>
</ChatLayout>
