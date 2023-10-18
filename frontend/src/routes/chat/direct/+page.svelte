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

	let privateMessageHistory: PrivateMessageHistoryDto[] = [];
	let privateChatHandler = new PrivateChatHandler();

	function onSelectChat(historyId: number) {
		privateChatHandler.setSelectedHistory(historyId, $profile);
		$selectedDirect = privateChatHandler.selectedHistory ?? null;
		updatePrivateVariables();
	}

	function updatePrivateVariables() {
		messages = privateChatHandler.messages;
		privateMessageHistory = privateChatHandler.privateMessageHistory;
	}

	privateChatHandler.loading.then((history) => {
		privateChatHandler.setSelectedMessages($selectedDirect, $profile);
		updatePrivateVariables();
		console.log(history);
	});

	const onPrivateMessage = (message: PrivateMessageDto): void => {
		console.log(`### received private ${message.message}`);
		privateChatHandler.recieveMessage(message, $profile);
		updatePrivateVariables();
	};

	async function sendPrivateMessage(message: string) {
		if (!$selectedDirect) return;
		privateChatHandler.sendMessage(message, $onlineUsers, $selectedDirect, $profile);
		updatePrivateVariables();
		await privateChatHandler.confirmSendMessage($profile);
		updatePrivateVariables();
	}

	/*
 	Sockets 
	*/
	$socket.on('receivePrivateMessage', onPrivateMessage);

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});
</script>

<ChatLayout>
	<div class="contents" slot="list">
		<DirectList
			{privateMessageHistory}
			on:select={(e) => {
				onSelectChat(e.detail);
			}}
		/>
	</div>

	<div class="contents" slot="messages">
		<DirectMessages bind:messages sendMessage={sendPrivateMessage} />
	</div>
</ChatLayout>
