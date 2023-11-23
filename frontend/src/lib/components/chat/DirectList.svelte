<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { DashboardUsersList } from '$lib/dtos';
	import { getAvatarFromId } from '$lib/api';
	import UserAvatarStatus from '../UserAvatarStatus.svelte';
	import ListButton from '../lists/ListButton.svelte';
	import { selectedDirect } from '$lib/stores';

	const dispatch = createEventDispatcher();

	export let historyList: DashboardUsersList[];
</script>

<div class="flex-auto w-full flex flex-col overflow-x-hidden overflow-y-auto file:rounded-lg mb-2 pb-5">
	{#each historyList as history}
		<div
			class="border-b border-white border-opacity-20 p-1 flex flex-row gap-2 items-center justify-between rounded-lg
			{$selectedDirect?.id == history.id ? 'bg-[#570b0b]' : ''}"
		>
			<button
				class="items-start grow hover:bg-white hover:bg-opacity-20 rounded-md h-full"
				on:click={() => dispatch('select', history.id)}
			>
				<UserAvatarStatus user={history} getAvatar={getAvatarFromId} />
			</button>
			<div class="flex flex-row items-center gap-1 text-center text-xs justify-end flex-wrap">
				<ListButton on:click={() => dispatch('profile', history.id)} type="profile" />
				{#if !history.isBlocked}
					<ListButton on:click={() => dispatch('block', history.id)} type="block" />
					{#if history.status == 'online' && !history.isBlockedBy}
						<ListButton on:click={() => dispatch('play', history.id)} type="play" />
					{/if}
					{#if history.isFriend}
						<ListButton on:click={() => dispatch('unfriend', history.id)} type="unfriend" />
					{:else}
						<ListButton on:click={() => dispatch('friend', history.id)} type="friend" />
					{/if}
				{:else}
					<ListButton on:click={() => dispatch('unblock', history.id)} type="unblock" />
				{/if}
			</div>
		</div>
	{/each}
</div>
