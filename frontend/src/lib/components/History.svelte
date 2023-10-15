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
			mineScore: 2
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 2
		},
		{
			openentNick: 'Teste',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 3,
			mineScore: 5
		},
		{
			openentNick: 'Teste2',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 6,
			mineScore: 5
		},
		{
			openentNick: 'Teste3',
			oponentAvatar: '../../hackathon.png',
			oponentScore: 2,
			mineScore: 4
		},{
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
						class="avatar max-w-sm aspect-square w-20"
						src={match.oponentAvatar}
						alt={match.openentNick}
						title={match.openentNick}
					/>
					<p class="text-5xl p-4">{match.oponentScore} - {match.mineScore}</p>
					<div class="w-20">
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
