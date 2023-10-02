<script lang="ts">
	import type { AxiosResponse } from 'axios';
	import Image from './Image.svelte';

	type Match = {
		//oponentID: string;
		openentNick: string;
		oponentAvatar: string | null;
		mineScore: number;
		oponentScore: number;
	};
	const matchs: Match[] = [
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 4
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 1
		}
	];
	export let avatar: Promise<AxiosResponse<Blob> | null>;
</script>

	<div class="mt-10 mb-10 justify-start w-full">
		<div class="btn-history w-1/2 mx-auto min-w-fit">History</div>
	</div>

	{#each matchs as match, i}
		<div class="border-4 mt-3 flex">
			<div class="w-full flex flex-row gap-2 items-center justify-center min-w-fit">
				<img
					class="avatar max-w-sm aspect-square w-10"
					src={match.oponentAvatar}
					alt={match.openentNick}
					title={match.openentNick}
				/>
				{match.oponentScore} x {match.mineScore}
				{#await avatar}
					<Image />
				{:then avatar}
					{#if avatar}
						<img class="avatar" src={URL.createObjectURL(avatar?.data)} alt="d" />
					{:else}
						<Image />
					{/if}
				{/await}
			</div>
		</div>
	{/each}

<style>
	.win-display {
		border-color: rgb(21, 159, 0);
	}
	.lose-display {
		border-color: rgb(185 28 28);
	}
</style>
