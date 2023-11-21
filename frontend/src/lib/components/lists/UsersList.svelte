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
	export let playDisabled = false;

	function onSelectUser(id: number) {
		goto(`public/${id}`);
	}
</script>

<div class="border-4 border-white flex flex-col rounded-3xl pb-2 h-full">
	<div class="flex-none flex justify-center p-3">
		<div class="w-full mx-auto min-w-fit mb-4 rounded-xl btn-users">USERS</div>
	</div>
	<div class="flex flex-col justify-start overflow-auto overflow-x-hidden">
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
							{#if !user.isBlocked}
								{#if !user.isBlockedBy}
									<ListButton on:click={() => dispatch('chat', user)} type="chat" />
									{#if user.status == 'online'}
										<ListButton
											on:click={() => dispatch('play', user.id)}
											type="play"
											disabled={playDisabled}
										/>
									{/if}
								{/if}
								<ListButton on:click={() => dispatch('block', user.id)} type="block" />
								{#if user.isFriend}
									<ListButton on:click={() => dispatch('unfriend', user.id)} type="unfriend" />
								{:else}
									<ListButton on:click={() => dispatch('friend', user.id)} type="friend" />
								{/if}
							{:else}
								<ListButton on:click={() => dispatch('unblock', user.id)} type="unblock" />
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		{/await}
	</div>
</div>
