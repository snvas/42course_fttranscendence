<script lang="ts">
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { socket, selectedDirect, profile, onlineUsers, selectedGroup } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type {
		ComponentMessage,
		GroupMessageDto,
		GroupChatDto
	} from '$lib/dtos';
	import { getAvatarFromId, getProfile, readAllGroupChats } from '$lib/api';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import GroupList from '$lib/components/chat/GroupList.svelte';

	let messages: ComponentMessage[] | null = null;
	let selectedHistory: GroupMessageDto | null = null;

	let groupChatHistory: Promise<GroupChatDto[]>;

	async function loadAllGroups(): Promise<GroupChatDto[]> {
		return readAllGroupChats();
	}

	// $socket.on('receivePrivateMessage', onPrivateMessage);

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});

	async function onCreateGroup() {
		goto('/chat/group/create');
	}

	groupChatHistory = loadAllGroups();
</script>

<ChatLayout selected="group">
	<div class="contents" slot="list">
		<div class="w-full flex flex-col grow overflow-x-auto">
			{#await groupChatHistory then groupChatHistory}
				<GroupList historyList={groupChatHistory} />
			{/await}
		</div>
		<div class="p-3">
			<button
				class="btn-primary w-full md:text-2xl text-xs flex justify-center h-fit flex-initial"
				on:click={onCreateGroup}
			>
				Criar um Grupo
			</button>
		</div>
	</div>

	<div class="contents" slot="messages">
		<GroupMessages bind:messages />
	</div>
</ChatLayout>
