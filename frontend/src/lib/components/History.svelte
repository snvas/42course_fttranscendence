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
		<div class="btn-history w-1/2 mx-auto min-w-fit mb-4">History</div>
	</div>

	<div class="flex flex-col gap-4 overflow-auto">
		{#each matchs as match, i}
			<div class="border-4 flex">
				<div class="w-full flex flex-row gap-2 items-center justify-center min-w-fit">
					<img
						class="avatar max-w-sm aspect-square w-20"
						src={match.oponentAvatar}
						alt={match.openentNick}
						title={match.openentNick}
					/>
					{match.oponentScore} x {match.mineScore}
					<div class="w-20">
						<AvatarImage {avatar} />
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.win-display {
		border-color: rgb(21, 159, 0);
	}
	.lose-display {
		border-color: rgb(185 28 28);
	}
</style>
