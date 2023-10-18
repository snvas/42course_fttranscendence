<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import AvatarImage from './AvatarImage.svelte';

	type Match = {
		//oponentID: string;
		openentNick: string;
		oponentAvatar: string | null;
		mineScore: number;
		oponentScore: number;
	};
	
	export let matchs: Match[];
	export let avatar: Promise<AxiosResponse<Blob> | null> | null;
</script>

<div class="flex flex-col w-full">
	<div class="justify-start w-full">
		<div class="btn-history w-1/2 mx-auto min-w-fit mb-4 rounded-xl">History</div>
	</div>

	<div class="flex flex-col gap-2 overflow-auto">
		{#each matchs as match, i}
			<div class="border-4 flex rounded-xl m-2 p-2
			{match.mineScore > match.oponentScore ? 'green' : 
			match.mineScore === match.oponentScore ? 'yellow' : 'red'}">
				<div class="w-full flex flex-row gap-2 items-center justify-center min-w-fit">
					<img
						class="avatar max-w-sm aspect-square xl:w-20 w-12"
						src={match.oponentAvatar}
						alt={match.openentNick}
						title={match.openentNick}
					/>
					<p class="xl:text-5xl lg:text-3xl text-2xl p-4">{match.oponentScore} - {match.mineScore}</p>
					<div class="xl:w-20 w-12">
						<AvatarImage {avatar} />
					</div>
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
	.yellow {
		@apply border-yellow-600;
		@apply text-yellow-700;
	}
</style>
