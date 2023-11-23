<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import AvatarImage from './AvatarImage.svelte';
	import type { MatchHistoryDto } from '$lib/dtos';
	import { getAvatarFromId } from '$lib/api';
	
	export let matchs: MatchHistoryDto[];
	export let avatar: Promise<AxiosResponse<Blob> | null> | null;
</script>

<div class="flex flex-col w-full">
	<div class="justify-start w-full">
		<div class="btn-history w-1/2 mx-auto min-w-fit mb-4 rounded-xl">History</div>
	</div>

	<div class="flex flex-col gap-2 overflow-auto">
		{#each matchs as match, i}
			<div class="border-4 flex rounded-xl m-2 p-2
			{match.winner == 'me' ? 'green' :  'red'}">
				<div class="w-full flex flex-row gap-2 items-center justify-center min-w-fit">
					<p>{match.opponent.nickname}</p>
					<div class="xl:w-20 w-12">
					<AvatarImage avatar={getAvatarFromId(match.opponent.avatarId ?? null)} /></div>
					<p class="xl:text-5xl lg:text-3xl text-2xl p-4">{match.opponentScore} - {match.myScore}</p>
					<div class="xl:w-20 w-12">
						<AvatarImage {avatar} />
					</div>
					<p>{match.opponent.nickname}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.green {
		@apply border-green-700;
		@apply text-green-700;
	}
	.red {
		@apply border-red-700;
		@apply text-red-700;
	}
</style>
