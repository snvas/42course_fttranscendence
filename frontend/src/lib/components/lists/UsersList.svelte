<script lang="ts">
	import type { DashboardUsersList } from '$lib/dtos';
	import type { AxiosResponse } from 'axios';
	import { createEventDispatcher } from 'svelte';
	import { profile } from '$lib/stores';
	import UserAvatarStatus from '../UserAvatarStatus.svelte';
	import { goto } from '$app/navigation';
	import ListButton from './ListButton.svelte';

	export let users: DashboardUsersList[];
	export let getAvatar: (avatarId: number | null) => Promise<AxiosResponse<Blob> | null> | null;
	export let loading: Promise<any>;
	const dispatch = createEventDispatcher();

	function onSelectUser(id: number) {
		goto(`public/${id}`);
	}
</script>

<div class="border-4 border-white h-full flex flex-col rounded-3xl pb-2">
	<div class="flex-none flex justify-center p-3">
		<div class="w-full mx-auto min-w-fit mb-4 rounded-xl btn-users">USERS</div>
	</div>
	<div class="overflow-y-auto flex flex-col justify-start">
		{#await loading}
			Carregando
		{:then}
			{#each users as user}
				{#if user.id != $profile.id}
					<div class="border-b border-opacity-20 border-white flex flex-row p-1 gap-4 items-center">
						<button
							class=" bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg flex-1"
							on:click={() => onSelectUser(user.id)}
						>
							<UserAvatarStatus {user} {getAvatar} />
						</button>
						<div
							class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-initial"
						>
							<!-- {#if !user.blocked}
				{#if !user.friend}
					<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
						<img src="/adicionar-usuario.png" alt="add friend" width="90%" />
						<p class="text-center">FRIEND</p>
					</button>
				{/if} -->
							<ListButton on:click={() => dispatch('chat', user)} type="chat" />
							<ListButton on:click={() => dispatch('block', user.id)} type="block" />
							<ListButton on:click={() => dispatch('play', user.id)} type="play" />
							{#if user.isFriend}
								<ListButton on:click={() => dispatch('unfriend', user.id)} type="unfriend" />
							{:else}
								<ListButton on:click={() => dispatch('friend', user.id)} type="friend" />
							{/if}
							<!-- {:else}
				<button class="w-10 bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/bloqueado.png" alt="block this user" width="90%" />
					<p class="text-center">UNBLOCK</p>
				</button>
			{/if} -->
						</div>
					</div>
				{/if}
			{/each}
		{/await}
	</div>
</div>
