<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PrivateMessageHistoryDto } from '$lib/dtos';
	import { getAvatarFromId } from '$lib/api';
	import AvatarImage from '$lib/components/AvatarImage.svelte';

	const dispatch = createEventDispatcher();

	export let privateMessageHistory: PrivateMessageHistoryDto[];
</script>

<div class="h-full w-full flex flex-col">
	{#each privateMessageHistory as history}
		<button
			on:click={() => dispatch('select', history.id)}
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
