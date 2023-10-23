<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PlayerStatusDto } from '$lib/dtos';
	import { getAvatarFromId } from '$lib/api';
	import UserAvatarStatus from '../UserAvatarStatus.svelte';
	import ListButton from '../lists/ListButton.svelte';

	const dispatch = createEventDispatcher();

	export let historyList: PlayerStatusDto[];
</script>

<div class="flex-auto w-full flex flex-col overflow-auto rounded-lg mb-2">
	{#each historyList as history}
		<button
			on:click={() => dispatch('select', history.id)}
			class="border-b-2 border-x-white h-12 pr-2 flex flex-row gap-4 items-center justify-between"
		>
			<UserAvatarStatus user={history} getAvatar={getAvatarFromId} />
			<div class="flex flex-row items-center gap-4 text-center text-xs justify-end flex-wrap">
				<ListButton on:click={() => dispatch('block', history.id)} type="block" />
				<ListButton on:click={() => dispatch('play', history.id)} type="play" />
			</div>
		</button>
	{/each}
</div>
