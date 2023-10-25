<script lang="ts">
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { useAuth, socket, selectedDirect, profile, onlineUsers } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type { PrivateMessageDto, PrivateMessageHistoryDto, ComponentMessage, GroupMessageDto, GroupChatDto } from '$lib/dtos';
	import { getAvatarFromId, getProfile } from '$lib/api';
	import DirectList from '$lib/components/chat/DirectList.svelte';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import AvatarImage from '$lib/components/AvatarImage.svelte';

	let messages: ComponentMessage[] | null = null;
	let selectedGroup: GroupMessageDto | null = null

	let groupMessageHistory: GroupMessageDto[] = [];
	let groupChatHistory: GroupChatDto[] = [];



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

	async function onCreateGroup() {
		//await GroupCreationDto;
		goto('/chat/group/create');
	}
</script>

<ChatLayout selected="group">
	<div class="h-full w-full flex flex-col p-2" slot="list">
		<div class="h-full w-full flex flex-col grow">
			{#each groupChatHistory as history}
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
			<button
				class="btn-primary w-full md:text-2xl text-xs flex justify-center h-fit flex-initial"
				on:click={onCreateGroup}
			>
				Criar um Grupo
			</button>
	</div>

	<div class="contents" slot="messages">
		<GroupMessages bind:messages />
	</div>
</ChatLayout>
