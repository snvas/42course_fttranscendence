<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PlayerStatusDto } from '$lib/dtos';
	import { getAvatarFromId } from '$lib/api';
	import AvatarImage from '$lib/components/AvatarImage.svelte';

	const dispatch = createEventDispatcher();

	export let historyList: PlayerStatusDto[];
</script>

<div class="h-full w-full flex flex-col">
	{#each historyList as history}
		<button
			on:click={() => dispatch('select', history.id)}
			class="border-b-2 border-x-white h-12 pr-2 flex flex-row gap-4 items-center justify-between"
		>
			<div class="flex gap-4 items-center">
				<div class="h-10 w-10">
					<AvatarImage avatar={getAvatarFromId(history.avatarId ?? null)} />
				</div>

				<div class="flex flex-col justify-start">
					<p class="flex">{history.nickname}</p>
				</div>
			</div>
			<div class="flex flex-row items-center gap-4 text-center text-xs justify-end flex-wrap">
				<button class="bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/bloqueado.png" alt="block this user" class="w-6" />
					<p class="text-center text-xs">BLOCK</p>
				</button>
				<button class="bg-white bg-opacity-0 hover:bg-opacity-20 rounded-lg p-1">
					<img src="/pingue-pongue.png" alt="let's play" class="w-6" />
					<p class="text-center text-xs">PLAY</p>
				</button>
			</div>
		</button>
	{/each}
</div>
