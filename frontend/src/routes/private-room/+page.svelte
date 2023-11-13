<script lang="ts">
	import { goto } from '$app/navigation';
	import { socket, useAuth, match } from '$lib/stores';
	import { socketEvent } from '../../../../backend/src/ws/ws-events';
	import type { MatchEventDto } from '$lib/dtos';
	import PongHeader from '$lib/components/PongHeader.svelte';
	import { matchMakingService } from '$lib/api';

	const auth = useAuth();

	$: if (!$auth.loading && !$auth.session) {
		$socket.disconnect();
		goto('/login');
	}

	$socket.on(socketEvent.MATCH_FOUND, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match found: ${data.matchId}`);
		status = 'confirm';
	});

	$socket.on(socketEvent.MATCH_STARTED, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match started: ${data.matchId}`);
		goto('/game');
	});

	$socket.on(socketEvent.MATCH_REJECTED, (data: MatchEventDto) => {
		match.set(data);
		console.log(`Match rejected: ${data.matchId}`);
		goto('/dashboard');
	});

	$: console.log($match);

	let status: 'waiting-confirm' | 'confirm' = setStatus($match);

	function setStatus(match:MatchEventDto | null) {
		if (match!.as == 'p1') {
			return 'waiting-confirm';
		} else {
			return 'confirm';
		}
	}

	async function confirmMatch() {
		if (!$match) return;
		try {
			await matchMakingService.acceptMatch($match.matchId, $match.as);
			status = 'waiting-confirm';
		} catch (e) {
			console.log(e);
		}
	}

	async function rejectMatch() {
		if (!$match) return;
		try {
			await matchMakingService.rejectMatch($match.matchId, $match.as);
			goto('/dashboard');
		} catch (e) {
			console.log(e);
		}
	}
</script>

<div class="h-full min-h-screen w-full min-w-screen flex flex-col lg:h-screen lg:w-screen">
	<div class="flex-none">
		<PongHeader />
	</div>
	{#if status == 'waiting-confirm'}
	<div class="flex flex-col mx-auto pt-18 items-center gap-10 mt-20 border-4 p-16 rounded-lg">
		<h1 class="text-3xl text-center">Aguarde o outro jogador confirmar...</h1>
	</div>
	{:else if status == 'confirm'}
	<div class="flex flex-col mx-auto pt-18 items-center gap-10 mt-20 border-4 p-16 rounded-lg w-full">
		<h1 class="text-3xl text-center">Começar a partida?</h1>
		<div class="flex flex-row gap-6 w-full">
			<button class="btn-deleted" on:click={rejectMatch}>Rejeitar</button>
			<button class="btn-primary" on:click={confirmMatch}>Confirmar</button>
		</div>
	</div>
	{/if}
</div>
