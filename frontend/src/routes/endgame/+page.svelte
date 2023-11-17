<script lang="ts">
	import { goto } from '$app/navigation';
	import { matchMakingService } from '$lib/api';
	import { useAuth, match } from '$lib/stores';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import type { MatchHistoryDto } from '../../../../backend/src/match/models/match-history.dto';
	import AvatarImage from '$lib/components/AvatarImage.svelte';
	import { getAvatarFromId } from '$lib/api';

	let auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		goto('/login');
	}

	async function onExit() {
		goto('/dashboard');
	}

	let lastMatch : MatchHistoryDto | null = null;

	async function getMatchHistory() {
		let response = await matchMakingService.getMatchHistory();
		let history = response.data;

		lastMatch = history.find((x) => { return x.matchId == $match?.matchId }) ?? null;
	}

	getMatchHistory()
</script>

<style>
	.win-color {
		color: #84cc16;
	}

	.lose-color {
		color: #ef4444;
	}

</style>

<div class="w-screen h-full min-h-screen">
	<PongHeader />
	<div class="flex flex-col items-center m-14">
		<div class="border-4 rounded-lg flex flex-col items-center gap-4 h-fit md:p-14 p-12">
			{#if lastMatch && lastMatch.winner == "me"}
				<p class="md:text-8xl text-6xl win-color">YOU WIN</p>
			{:else}
				<p class="md:text-8xl text-6xl lose-color">YOU LOSE</p>
			{/if}
			<div class="flex flex-row m-5">
				<div class="flex flex-col items-center">
					<div class="md:w-24 md:h-24 w-12 h-12">
						<AvatarImage avatar={getAvatarFromId(lastMatch?.me.avatarId ?? null)} />
					</div>
					<p class="mt-4">{lastMatch?.me.nickname}</p>
				</div>
				<p class="md:text-6xl text-2xl m-5">{lastMatch?.myScore} x {lastMatch?.opponentScore}</p>
				<div class="flex flex-col items-center">
					<div class="md:w-24 md:h-24 w-12 h-12">
						<AvatarImage avatar={getAvatarFromId(lastMatch?.opponent.avatarId ?? null)} />
					</div>
					<p class="mt-4">{lastMatch?.opponent.nickname}</p>
				</div>
			</div>
			<button class="btn-primary-red" on:click={onExit}>Exit</button>
		</div>
	</div>
</div>
