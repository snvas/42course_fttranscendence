<script lang="ts">
	
	import Image from './Image.svelte';
type Match = {
	//oponentID: string;
	openentNick: string;
	oponentAvatar: string | null;
	mineScore: number;
	oponentScore: number;
	status: string;
};
const matchs: Match[] = [
	{
		openentNick: 'Fulano',
		oponentAvatar: '../../hackathon.png',
		oponentScore: 3,
		mineScore: 5,
		status: 'Online'
	},
	{
		openentNick: 'Sicrano',
		oponentAvatar: '../../palavra-chave.png',
		oponentScore: 3,
		mineScore: 5,
		status: 'Offline'
	},
	{
		openentNick: 'Beltrano',
		oponentAvatar: '../../rapido.png',
		oponentScore: 2,
		mineScore: 4,
		status: 'Jogando'
	},
	{
		openentNick: 'Colega',
		oponentAvatar: '../../camera.png',
		oponentScore: 2,
		mineScore: 1,
		status: 'Jogando'
	}
];
</script>
{#each matchs as match, i}
<div class="flex flex-col">
	<div class="border-b-2 border-x-white h-12 m-2 flex flex-row">
		<img
		class="avatar max-w-sm aspect-square w-10"
		src={match.oponentAvatar}
		alt={match.openentNick}
		title={match.openentNick}
	/>	
		<div class="flex flex-col ml-3">
			<p class="flex flex-col">{match.openentNick}</p>
			<p class="flex flex-col text-green-600">{match.status}</p>
		</div>
	</div>
</div>
{/each}