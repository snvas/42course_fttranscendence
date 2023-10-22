<script lang="ts">
	import PongHeader from '$lib/components/PongHeader.svelte';
	import DirectMessages from '$lib/components/chat/DirectMessages.svelte';
	import GroupMessages from '$lib/components/chat/GroupMessages.svelte';
	import { useAuth, socket, selectedDirect, profile, onlineUsers } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type { PrivateMessageDto, PrivateMessageHistoryDto, ComponentMessage } from '$lib/dtos';
	import { getAvatarFromId, getProfile } from '$lib/api';
	import DirectList from '$lib/components/chat/DirectList.svelte';
	import ChatLayout from '$lib/components/chat/ChatLayout.svelte';
	import AvatarImage from '$lib/components/AvatarImage.svelte';

	let messages: ComponentMessage[] | null = null;
	let groupMessageHistory: PrivateMessageHistoryDto[] = [];

	function onSelectChat(historyId: number) {}

	onDestroy(() => {
		$socket.off('receivePrivateMessage');
	});

	let selected = 'Public';

	let options = ['Public', 'Private'];
</script>

<div class="w-screen h-full min-h-screen">
	<PongHeader />
	<div class="flex flex-col justify-end items-end">
		<a href="/chat/group"
			><i class="fa fa-window-close-o mr-10 text-3xl icon-link" aria-hidden="true" /></a
		>
	</div>
	<div class="w-full flex flex-row gap-10 border-4 border-white rounded-3xl mt-20 p-5">
		<div class="flex flex-col w-full items-center gap-3 p-10">
			<h1 class="text-white">Create a Group</h1>
			<input class="input-primary w-2/4" placeholder="Group Name" />
			<div class="border-4 border-white p-5 rounded-lg w-2/4">
				<h2 class="text-center">Set Group Visibility</h2>
				<div class="flex flex-col text-xl gap-5 p-10">
					{#each options as value}
						<label><input type="radio" {value} bind:group={selected} /> {value}</label>
					{/each}
					<form
						class="flex-initial w-1/2 border-2 border-white m-2 flex items-center justify-center bg-white rounded-md h-12 gap-2"
					>
						<input
							placeholder="Create Password"
							class="text-center w-full h-full text-black text-xs"
						/>
						<button class="bg-black p-3 rounded-md hover:bg-slate-500 text-xs"> SEND </button>
					</form>
					<button class="btn-primary w-1/3 md:text-2xl text-xs text-center min-w-fit p-4"
						>Create</button
					>
				</div>
			</div>
		</div>
	</div>
</div>
